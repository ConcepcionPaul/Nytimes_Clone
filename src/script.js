let bookReviews = [];

function fetchBookReviews() {
    fetch('https://api.nytimes.com/svc/books/v3/lists/current/hardcover-fiction.json?api-key=ZVFsJPMKAysNNRwaeKjLsXP1I6IfBlRK')
        .then(response => response.json())
        .then(data => {
            bookReviews = data.results.books;
            displayReviews(bookReviews); 
        })
        .catch(error => console.error('Error fetching data:', error));
}

function displayReviews(reviews) {
    const container = document.getElementById('reviews-container');
    container.innerHTML = ''; 
    reviews.forEach(review => {
        const cardDiv = document.createElement('div');
        cardDiv.classList.add('card');

        cardDiv.innerHTML = `
            <div class="image">
                <img src="${review.book_image}" alt="${review.title} cover" class="book-cover">
            </div>
            <div class="card__info">
                <span class="title">${review.title}</span>
                <p class="author">By ${review.author}</p>
                <p class="description">${review.description}</p>
                <a href="${review.amazon_product_url}" target="_blank" class="buy-link">Buy on Amazon</a>
            </div>
        `;

        container.appendChild(cardDiv);
    });
}

function handleSearch() {
    const searchTerm = document.getElementById('search-bar').value.toLowerCase();
    const filteredReviews = bookReviews.filter(review => 
        review.title.toLowerCase().includes(searchTerm) || 
        review.description.toLowerCase().includes(searchTerm)
    );
    displayReviews(filteredReviews); 
}

function showSuggestions() {
    const searchBar = document.getElementById('search-bar');
    const suggestionsContainer = document.getElementById('suggestions-container');
    const searchTerm = searchBar.value.toLowerCase();
    
    suggestionsContainer.innerHTML = '';
    
    if (searchTerm) {
        const suggestions = bookReviews.filter(review => 
            review.title.toLowerCase().includes(searchTerm)
        );
        
        suggestions.forEach(review => {
            const suggestionDiv = document.createElement('div');
            suggestionDiv.classList.add('suggestion');
            suggestionDiv.textContent = review.title;
        
            suggestionDiv.addEventListener('click', () => {
                searchBar.value = review.title;
                suggestionsContainer.innerHTML = ''; 
                handleSearch();
            });
            
            suggestionsContainer.appendChild(suggestionDiv);
        });
        
        suggestionsContainer.style.display = 'block';
    } else {
        suggestionsContainer.style.display = 'none';
    }
}

window.onload = fetchBookReviews;

document.getElementById('search-bar').addEventListener('input', showSuggestions);
document.getElementById('search-bar').addEventListener('keyup', (event) => {
    if (event.key === 'Enter') {
        handleSearch();
    }
});

