let bookReviews = [];
let currentList = [];
let pageSize = 8;
let visibleCount = 0;
let debounceTimer = null;
let activeIndex = -1;

function fetchBookReviews() {
    const container = document.getElementById('reviews-container');
    container.setAttribute('aria-busy', 'true');
    renderSkeletons(container, 4);
    const cacheKey = 'nyt_books_cache_v1';
    const ttlMs = 10 * 60 * 1000; // 10 minutes
    try {
        const cached = JSON.parse(localStorage.getItem(cacheKey) || 'null');
        if (cached && (Date.now() - cached.timestamp) < ttlMs && Array.isArray(cached.data)) {
            bookReviews = cached.data;
            currentList = bookReviews.slice();
            const savedVisible = getVisibleCountFromCache();
            visibleCount = Math.min(savedVisible || pageSize, currentList.length);
            displayReviews(currentList);
            restoreSearchFromCache();
            return;
        }
    } catch {}

    fetchBookData()
        .then(data => {
            bookReviews = data.results.books || [];
            try { localStorage.setItem(cacheKey, JSON.stringify({ timestamp: Date.now(), data: bookReviews })); } catch {}
            currentList = bookReviews.slice();
            const savedVisible = getVisibleCountFromCache();
            visibleCount = Math.min(savedVisible || pageSize, currentList.length);
            displayReviews(currentList);
            restoreSearchFromCache();
            setVisibleCountInCache(visibleCount);
        })
        .catch(() => {
            container.setAttribute('aria-busy', 'false');
            container.innerHTML = '<div class="empty-state"><h3>We couldn’t load the list.</h3><p>Please check your connection and refresh the page.</p></div>';
            updateResultsCount(0, true);
        });
}

function displayReviews(reviews) {
    const container = document.getElementById('reviews-container');
    container.innerHTML = ''; 
    const toRender = reviews.slice(0, visibleCount || pageSize);
    container.setAttribute('aria-busy', 'false');
    if (!reviews.length) {
        container.innerHTML = '<div class="empty-state"><h3>No books found.</h3><p>Try a different title, author, or keyword.</p></div>';
    }
    toRender.forEach(review => {
        const cardDiv = document.createElement('div');
        cardDiv.classList.add('card');
        cardDiv.setAttribute('role', 'listitem');

        cardDiv.innerHTML = `
            <div class="image">
                <img src="${review.book_image}" alt="Cover of ${review.title}" class="book-cover" loading="lazy" decoding="async">
            </div>
            <div class="card__info">
                <a class="title" href="${review.amazon_product_url}" target="_blank" rel="noopener noreferrer">${review.title}</a>
                <p class="author">By ${review.author}</p>
                <p class="description">${review.description}</p>
                <a href="${review.amazon_product_url}" target="_blank" rel="noopener noreferrer" class="buy-link">View book <span aria-hidden="true">↗</span></a>
            </div>
        `;

        container.appendChild(cardDiv);
    });

    const loadMoreBtn = document.getElementById('load-more');
    if (loadMoreBtn) {
        if (visibleCount < reviews.length) {
            loadMoreBtn.style.display = 'inline-block';
        } else {
            loadMoreBtn.style.display = 'none';
        }
    }
    updateResultsCount(reviews.length);
}

function updateResultsCount(total, isError = false) {
    const count = document.getElementById('results-count');
    if (!count) return;
    count.textContent = isError ? 'List unavailable' : `${total} ${total === 1 ? 'book' : 'books'} found`;
}

function getVisibleCountFromCache() {
    const saved = Number.parseInt(localStorage.getItem('nyt_visible_count') || '', 10);
    return Number.isFinite(saved) && saved > 0 ? saved : pageSize;
}

function setVisibleCountInCache(count) {
    try { localStorage.setItem('nyt_visible_count', String(count)); } catch {}
}

function restoreSearchFromCache() {
    try {
        const savedQuery = localStorage.getItem('nyt_search_query') || '';
        const input = document.getElementById('search-bar');
        if (savedQuery && input) {
            input.value = savedQuery;
            handleSearch();
        }
    } catch {}
}

function renderSkeletons(container, count) {
    container.innerHTML = '';
    for (let i = 0; i < count; i++) {
        const wrap = document.createElement('div');
        wrap.className = 'skeleton-card';
        wrap.innerHTML = `
            <div class="skeleton-box skeleton-image"></div>
            <div class="skeleton-lines">
                <div class="skeleton-box skeleton-line long"></div>
                <div class="skeleton-box skeleton-line med"></div>
                <div class="skeleton-box skeleton-line short"></div>
            </div>
        `;
        container.appendChild(wrap);
    }
}

function handleSearch() {
    const searchTerm = document.getElementById('search-bar').value.toLowerCase();
    const filteredReviews = bookReviews.filter(review =>
        review.title.toLowerCase().includes(searchTerm) ||
        review.author.toLowerCase().includes(searchTerm) ||
        review.description.toLowerCase().includes(searchTerm)
    );
    currentList = filteredReviews;
    visibleCount = Math.min(pageSize, currentList.length);
    setVisibleCountInCache(visibleCount);
    displayReviews(currentList);
}

function showSuggestions() {
    const searchBar = document.getElementById('search-bar');
    const suggestionsContainer = document.getElementById('suggestions-container');
    const searchTerm = searchBar.value.toLowerCase();
    
    suggestionsContainer.innerHTML = '';
    
    if (searchTerm) {
        const suggestions = bookReviews.filter(review => 
            review.title.toLowerCase().includes(searchTerm) ||
            review.author.toLowerCase().includes(searchTerm)
        ).slice(0, 8);
        
        suggestions.forEach((review, idx) => {
            const suggestionDiv = document.createElement('div');
            suggestionDiv.classList.add('suggestion');
            suggestionDiv.textContent = review.title;
            suggestionDiv.setAttribute('role', 'option');
            suggestionDiv.setAttribute('id', `suggestion-${idx}`);
            suggestionDiv.setAttribute('tabindex', '-1');
        
            suggestionDiv.addEventListener('click', () => {
                searchBar.value = review.title;
                suggestionsContainer.innerHTML = ''; 
                handleSearch();
            });
            
            suggestionsContainer.appendChild(suggestionDiv);
        });
        
        activeIndex = -1;
        searchBar.setAttribute('aria-expanded', suggestions.length ? 'true' : 'false');
        suggestionsContainer.style.display = suggestions.length ? 'block' : 'none';
    } else {
        activeIndex = -1;
        searchBar.setAttribute('aria-expanded', 'false');
        suggestionsContainer.style.display = 'none';
    }
}

window.onload = fetchBookReviews;

document.getElementById('search-bar').addEventListener('input', (e) => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
        showSuggestions();
        handleSearch();
    }, 300);
    try { localStorage.setItem('nyt_search_query', e.target.value || ''); } catch {}
});

document.getElementById('search-bar').addEventListener('keyup', (event) => {
    if (event.key === 'Enter') {
        handleSearch();
    }
});

document.getElementById('search-button').addEventListener('click', handleSearch);

document.addEventListener('click', (e) => {
    const container = document.querySelector('.search-bar');
    const suggestionsContainer = document.getElementById('suggestions-container');
    if (container && suggestionsContainer && !container.contains(e.target)) {
        suggestionsContainer.style.display = 'none';
    }
});

// Load More pagination
const loadMoreBtn = document.getElementById('load-more');
if (loadMoreBtn) {
    loadMoreBtn.addEventListener('click', () => {
        visibleCount = Math.min(visibleCount + pageSize, currentList.length);
        setVisibleCountInCache(visibleCount);
        displayReviews(currentList);
    });
}

// Keyboard navigation for suggestions
document.getElementById('search-bar').addEventListener('keydown', (e) => {
    const suggestionsContainer = document.getElementById('suggestions-container');
    const items = Array.from(suggestionsContainer.querySelectorAll('.suggestion'));
    if (!items.length) return;

    if (e.key === 'ArrowDown') {
        e.preventDefault();
        activeIndex = (activeIndex + 1) >= items.length ? 0 : activeIndex + 1;
    } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        activeIndex = (activeIndex - 1) < 0 ? items.length - 1 : activeIndex - 1;
    } else if (e.key === 'Enter' && activeIndex >= 0) {
        e.preventDefault();
        items[activeIndex].click();
        return;
    } else {
        return;
    }

    items.forEach((el, idx) => {
        if (idx === activeIndex) {
            el.classList.add('active');
            el.focus();
            document.getElementById('search-bar').setAttribute('aria-activedescendant', el.id);
        } else {
            el.classList.remove('active');
        }
    });
});

function fetchBookData() {
    const proxyUrl = '/.netlify/functions/nyt-proxy';
    const directUrl = 'https://api.nytimes.com/svc/books/v3/lists/current/hardcover-fiction.json?api-key=ZVFsJPMKAysNNRwaeKjLsXP1I6IfBlRK';
    return fetch(proxyUrl, { mode: 'cors' })
        .then(r => {
            if (!r.ok) throw new Error('proxy_failed');
            return r.json();
        })
        .catch(() => fetch(directUrl).then(r => r.json()));
}

const today = new Date();
document.getElementById('current-date').textContent = today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
document.getElementById('copyright-year').textContent = today.getFullYear();

