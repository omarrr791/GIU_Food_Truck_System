// Fetch and display product details
function fetchProductDetails() {
    const params = new URLSearchParams(window.location.search);
    const productId = params.get('id');

    if (!productId) {
        alert("Product ID not found!");
        return;
    }

    fetch(`/api/products/${productId}`)
        .then(response => response.json())
        .then(product => {
            document.getElementById('product-name').textContent = product.name;
            document.getElementById('product-description').textContent = product.description;
            document.getElementById('product-price').textContent = `$${product.price}`;
            document.getElementById('product-stock').textContent = product.quantity;
            document.getElementById('main-image').src = product.image;
        })
        .catch(err => alert("Failed to fetch product details."));
}

function addToCart() {
    const productId = new URLSearchParams(window.location.search).get('id');
    const quantity = parseInt(document.getElementById('quantity').value);

    if (!productId) {
        alert('Product ID is missing!');
        return;
    }

    if (!quantity || quantity <= 0) {
        alert('Please select a valid quantity.');
        return;
    }

    fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, quantity }),
    })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                alert(`Error: ${data.error}`);
            } else {
                alert(data.message || 'Product added to cart successfully.');
            }
        })
        .catch(error => {
            console.error('Error adding product to cart:', error);
            alert('Failed to add product to cart. Please try again.');
        });
}

// Initialize event listeners
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('add-to-cart').addEventListener('click', addToCart);
});

// Fetch and display user info
function fetchUserInfo() {
    fetch('/api/user', { credentials: 'include' })
        .then(response => response.json())
        .then(user => {
            if (user.error) {
                console.error(user.error);
                document.getElementById('user-name').textContent = 'Guest';
            } else {
                document.getElementById('user-name').textContent = user.username || 'Guest';
                document.getElementById('profile-pic').src = user.profile_image || 'default-profile.png';
            }
        })
        .catch(error => console.error('Error fetching user info:', error));
}

// Initialize user info fetch on page load
document.addEventListener('DOMContentLoaded', fetchUserInfo);

// Submit rating
function submitRating() {
    const productId = new URLSearchParams(window.location.search).get('id');
    const rating = document.querySelector('input[name="star"]:checked')?.value;

    if (!rating) {
        alert("Please select a rating!");
        return;
    }

    fetch(`/api/products/${productId}/rate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating }),
    })
        .then(response => response.json())
        .then(data => alert(data.message))
        .catch(err => alert("Failed to submit rating."));
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    fetchProductDetails();
    document.getElementById('add-to-cart').addEventListener('click', addToCart);
    document.getElementById('submit-rating').addEventListener('click', submitRating);
});
