let e=[];function t(e){let t=document.getElementById("reviews-container");t.innerHTML="",e.forEach(e=>{let n=document.createElement("div");n.classList.add("card"),n.innerHTML=`
            <div class="image">
                <img src="${e.book_image}" alt="${e.title} cover" class="book-cover">
            </div>
            <div class="card__info">
                <span class="title">${e.title}</span>
                <p class="author">By ${e.author}</p>
                <p class="description">${e.description}</p>
                <a href="${e.amazon_product_url}" target="_blank" class="buy-link">Buy on Amazon</a>
            </div>
        `,t.appendChild(n)})}function n(){let n=document.getElementById("search-bar").value.toLowerCase();t(e.filter(e=>e.title.toLowerCase().includes(n)||e.description.toLowerCase().includes(n)))}window.onload=function(){fetch("https://api.nytimes.com/svc/books/v3/lists/current/hardcover-fiction.json?api-key=ZVFsJPMKAysNNRwaeKjLsXP1I6IfBlRK").then(e=>e.json()).then(n=>{t(e=n.results.books)}).catch(e=>console.error("Error fetching data:",e))},document.getElementById("search-bar").addEventListener("input",function(){let t=document.getElementById("search-bar"),s=document.getElementById("suggestions-container"),a=t.value.toLowerCase();s.innerHTML="",a?(e.filter(e=>e.title.toLowerCase().includes(a)).forEach(e=>{let a=document.createElement("div");a.classList.add("suggestion"),a.textContent=e.title,a.addEventListener("click",()=>{t.value=e.title,s.innerHTML="",n()}),s.appendChild(a)}),s.style.display="block"):s.style.display="none"}),document.getElementById("search-bar").addEventListener("keyup",e=>{"Enter"===e.key&&n()});
//# sourceMappingURL=index.628286c6.js.map
