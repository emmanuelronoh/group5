document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
    loadBlogs();
   

    document.getElementById('product-form').addEventListener('submit', function(event) {
        event.preventDefault();
        addOrUpdateProduct();
    });

    document.getElementById('blog-form').addEventListener('submit', function(event) {
        event.preventDefault();
        addOrUpdateBlog();
    });

    document.getElementById('add-product-button').addEventListener('click', function() {
        showAddProductForm();
    });

   
});


function loadProducts() {
    fetch('http://localhost:3000/Products')
        .then(response => response.json())
        .then(data => {
            if (Array.isArray(data)) {
                const productSection = document.getElementById('products-section');
                productSection.innerHTML = '';

                const productCards = data.map(product => `
                    <div class="product-card col-md-4">
                        <img src="${product.productImage}" alt="${product.productName}" class="img-fluid">
                        <h3>${product.productName}</h3>
                        <p>${product.productPrice}</p>
                        <p>${product.productDescription}</p>
                        <button class="btn btn-primary" onclick="viewProduct('${product.productName}')">View Details</button>
                        <button class="btn btn-secondary" onclick="editProduct('${product.productName}')">Edit</button>
                        <button class="btn btn-success" onclick="buyProduct('${product.id}')">Buy Product</button>
                        <button class="btn btn-danger" onclick="deleteProduct('${product.id}')">Delete</button>
                    </div>
                `).join('');
                productSection.innerHTML = productCards;
            }
        })
        
}

function viewProduct(productName) {
    fetch('http://localhost:3000/Products')
        .then(response => response.json())
        .then(data => {
            const product = data.find(p => p.productName === productName);
            if (product) {
                const productDetailsContainer = document.getElementById('product-details-section');
                productDetailsContainer.innerHTML = `
                    <div class="col-md-6">
                        <img src="${product.productImage}" alt="${product.productName}" class="img-fluid">
                    </div>
                    <div class="col-md-6">
                        <h2>${product.productName}</h2>
                        <p>$${product.productPrice}</p>
                        <p>${product.productDescription}</p>
                        <div class="rating">
                            ${[1, 2, 3, 4, 5].map(rating => `
                                <input type="radio" name="rating-${product.id}" value="${rating}" ${product.rating === rating ? 'checked' : ''} onclick="rateProduct('${product.id}', ${rating})">
                                <label>${rating}</label>
                            `).join(' ')}
                        </div>
                        <button class="btn btn-secondary" onclick="showSection('products-section')">Back to Products</button>
                        <button class="btn btn-success" onclick="buyProduct('${product.id}')">Buy Product</button>
                    </div>
                `;
                showSection('product-details-section');
            }
        })
        .catch(error => console.error('Error viewing product:', error));
}


function editProduct(productName) {
    fetch('http://localhost:3000/Products')
        .then(response => response.json())
        .then(data => {
            const product = data.find(p => p.productName === productName);
            if (product) {
                document.getElementById('productImage').value = product.productImage;
                document.getElementById('productName').value = product.productName;
                document.getElementById('productPrice').value = product.productPrice;
                document.getElementById('productDescription').value = product.productDescription;
                document.getElementById('product-form').setAttribute('data-edit-id', product.id);
                showSection('product-form-section');
            }
        })
        .catch(error => console.error('Error editing product:', error));
}

function deleteProduct(productId) {
    fetch(`http://localhost:3000/Products/${productId}`, { method: 'DELETE' })
        .then(response => {
            if (response.ok) {
                loadProducts();
            } else {
                console.error('Error deleting product:', response.statusText);
            }
        })
        .catch(error => console.error('Error deleting product:', error));
}

function buyProduct(productId) {
    fetch("http://localhost:3000/Products/${productId}")
    .then(response => response.json())
    .then(product =>{
        cart.push(product);
        updateCartCount();
    })
    alert(`Product "${productId.productName} has been added to cart!`);
}
function updateCartCount(){
    const cartCount = document.getElementById("cart-count");
    cartCount.textContent = cart.length;

}

function showSection(sectionId) {
    const sections = ['products-section', 'product-details-section', 'product-form-section', 'blog-form-section','blog-section', 'blog-details-section',];
    sections.forEach(id => {
        document.getElementById(id).style.display = (id === sectionId) ? 'block' : 'none';
    });
    if (sectionId === "cart-section"){
        displayCart();
    }
}
function displayCart(){
    const cartSection = document.getElementById("cart-section");
    cartSection.innerHTML = cart.map(product => 
        `
        <div class="cart-item">
            <img src="${product.productImage}" alt="${product.productName}" class="img-fluid" width="100">
            <h4>${product.productName}</h4>
            <p>${product.productPrice}</p>
            <p>${product.productDescription}</p>
        </div>
    `).join('');

        
}

function addOrUpdateProduct() {
    const productImage = document.getElementById("productImage").value;
    const productName = document.getElementById("productName").value;
    const productPrice = document.getElementById("productPrice").value;
    const productDescription = document.getElementById("productDescription").value;

    const productInfo = { productImage, productName, productPrice, productDescription };

    const editId = document.getElementById('product-form').getAttribute('data-edit-id');
    const method = editId ? 'PATCH' : 'POST';
    const url = editId ? `http://localhost:3000/Products/${editId}` : "http://localhost:3000/Products";

    fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productInfo),
    })
        .then(response => response.json())
        .then(data => {
            loadProducts();
            showSection('products-section');
            document.getElementById('product-form').reset();
            document.getElementById('product-form').removeAttribute('data-edit-id');
        })
        .catch(error => console.error('Error adding/updating product:', error));
}

function showAddProductForm() {
    document.getElementById('product-form').reset();
    document.getElementById('product-form').removeAttribute('data-edit-id');
    showSection('product-form-section');
}
function updateProductRatingInUI(updatedProduct) {
    
    const productCard = document.querySelector(`.product-card[data-id="${updatedProduct.id}"]`);
    if (productCard) {
        const ratingInputs = productCard.querySelectorAll(`input[name="rating-${updatedProduct.id}"]`);
        ratingInputs.forEach(input => {
            if (parseInt(input.value) === updatedProduct.rating) {
                input.checked = true;
            } else {
                input.checked = false;
            }
        });
    }
}

function filterByPrice() {
    const filterValue = document.getElementById('price-filter').value;
    let sortedProducts = [...product];

    if (filterValue === 'low-high') {
        sortedProducts.sort((a, b) => a.productPrice - b.productPrice);
    } else if (filterValue === 'high-low') {
        sortedProducts.sort((a, b) => b.productPrice - a.productPrice);
    }

    displayProducts(sortedProducts);
}