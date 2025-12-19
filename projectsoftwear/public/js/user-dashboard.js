// Fetch and display user info
function fetchUserInfo() {
    fetch('/api/user', { credentials: 'include' })
        .then(response => response.json())
        .then(user => {
            document.getElementById('user-name').textContent = user.username || 'Guest';
            document.getElementById('user-role').textContent = user.role || '(Role not found)';
            document.getElementById('profile-pic').src = user.profile_image || 'default-profile.png';
        })
        .catch(error => console.error('Error fetching user data:', error));
}

// Toggle Sidebar Menu
function toggleMenu() {
    const menu = document.getElementById('menu-container');
    menu.classList.toggle('open');
}

// Load products with filters
function loadProducts() {
    const searchQuery = document.getElementById('searchInput').value.toLowerCase();
    const minPrice = parseFloat(document.getElementById('minPrice').value) || 0;
    const maxPrice = parseFloat(document.getElementById('maxPrice').value) || Infinity;
    const category = document.getElementById('categoryFilter').value;

    fetch('/api/products', { credentials: 'include' })
        .then(response => response.json())
        .then(data => {
            const filteredProducts = data.products.filter(product => {
                const matchesName = product.name.toLowerCase().includes(searchQuery);
                const matchesPrice = product.price >= minPrice && product.price <= maxPrice;
                const matchesCategory = !category || product.category === category;
                return matchesName && matchesPrice && matchesCategory;
            });
            renderProducts(filteredProducts);
        })
        .catch(error => console.error('Error loading products:', error));
}

// Render products
function renderProducts(products) {
    const productList = document.getElementById('productList');
    productList.innerHTML = '';

    if (products.length === 0) {
        productList.innerHTML = '<p>No products available.</p>';
        return;
    }

    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.classList.add('product');
        productCard.innerHTML = `
            <img src="${product.image || 'default-product.png'}" alt="${product.name}">
            <h3>${product.name}</h3>
            <p>Price: $${product.price}</p>
        `;

        // Navigate to product-details.html
        productCard.addEventListener('click', () => {
            window.location.href = `product-details.html?id=${product.id}`;
        });

        productList.appendChild(productCard);
    });
}

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    fetchUserInfo();
    loadProducts();

    document.getElementById('searchButton').addEventListener('click', loadProducts);
    document.getElementById('filterButton').addEventListener('click', loadProducts);
});
