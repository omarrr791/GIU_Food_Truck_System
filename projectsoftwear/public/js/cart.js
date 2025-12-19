// Fetch and display user information
function fetchUserInfo() {
    fetch('/api/user', { credentials: 'include' })
        .then(response => response.json())
        .then(user => {
            document.getElementById('user-name').textContent = user.username || 'Guest';
            document.getElementById('profile-pic').src = user.profile_image || 'default-profile.png';
        })
        .catch(error => console.error('Error fetching user info:', error));
}

// Display cart items
// Fetch and display cart items
function displayCart() {
    fetch('/api/cart', { credentials: 'include' })
        .then(response => response.json())
        .then(data => {
            const cart = data.cart || [];
            const cartContainer = document.getElementById('cart-container');
            const totalPriceElement = document.getElementById('total-price');

            cartContainer.innerHTML = '';
            let totalPrice = 0;

            if (cart.length === 0) {
                cartContainer.innerHTML = '<p>Your cart is empty.</p>';
                totalPriceElement.textContent = '0.00';
                return;
            }

            cart.forEach(item => {
                totalPrice += item.price * item.quantity;

                const cartItem = document.createElement('div');
                cartItem.classList.add('cart-item');
                cartItem.innerHTML = `
                    <div class="item-info">
                        <img src="${item.image}" alt="${item.name}">
                        <p>${item.name}</p>
                    </div>
                    <div class="item-details">
                        <p>Price: $${item.price.toFixed(2)}</p>
                        <p>Quantity: ${item.quantity}</p>
                    </div>
                `;
                cartContainer.appendChild(cartItem);
            });

            totalPriceElement.textContent = totalPrice.toFixed(2);
        })
        .catch(error => console.error('Error fetching cart:', error));
}

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    displayCart();
});
