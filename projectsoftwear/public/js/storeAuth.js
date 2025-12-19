$(document).ready(() => {
    let currentPage = 1;
    const productsPerPage = 10;

    // Fetch and display products
    function fetchProducts(query = '', category = '', page = 1) {
        fetch(`/api/products`)
            .then(response => response.json())
            .then(data => {
                const filteredProducts = data.products.filter(product => {
                    return (
                        (!query || product.name.toLowerCase().includes(query.toLowerCase())) &&
                        (!category || product.category === category)
                    );
                });

                const start = (page - 1) * productsPerPage;
                const paginatedProducts = filteredProducts.slice(start, start + productsPerPage);

                const productList = document.querySelector('.product-list');
                productList.innerHTML = paginatedProducts.map(product => `
                    <div class="product" data-id="${product.id}">
                        <img src="${product.image}" alt="${product.name}">
                        <h2>${product.name}</h2>
                        <p>${product.description}</p>
                        <p>Price: $${product.price}</p>
                        <button class="add-to-cart">Add to Cart</button>
                    </div>
                `).join('');

                updatePagination(filteredProducts.length, page);
            })
            .catch(error => console.error('Error fetching products:', error));
    }

    // Update pagination buttons
    function updatePagination(totalProducts, currentPage) {
        const totalPages = Math.ceil(totalProducts / productsPerPage);
        $('#page-info').text(`Page ${currentPage} of ${totalPages}`);
        $('#prev-page').prop('disabled', currentPage === 1);
        $('#next-page').prop('disabled', currentPage === totalPages);
    }

    // Event listener for "Add to Cart" button
    $(document).on('click', '.add-to-cart', function () {
        const productId = $(this).parent().data('id');
        const quantity = 1; // Default quantity

        const user = localStorage.getItem('user');
        if (!user) {
            alert('Please log in to add products to the cart.');
            window.location.href = 'login.html';
            return;
        }

        fetch('/api/cart', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ productId, quantity }),
        })
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    alert(`Error: ${data.error}`);
                } else {
                    alert(data.message);
                }
            })
            .catch(error => console.error('Error adding to cart:', error));
    });

    // Event listeners for search and filter
    $('#search-input').on('input', function () {
        fetchProducts($(this).val(), $('#filter-category').val(), currentPage);
    });

    $('#filter-category').on('change', function () {
        fetchProducts($('#search-input').val(), $(this).val(), currentPage);
    });

    // Pagination buttons
    $('#prev-page').on('click', function () {
        if (currentPage > 1) {
            currentPage--;
            fetchProducts($('#search-input').val(), $('#filter-category').val(), currentPage);
        }
    });

    $('#next-page').on('click', function () {
        currentPage++;
        fetchProducts($('#search-input').val(), $('#filter-category').val(), currentPage);
    });

    // Initial fetch of products
    fetchProducts();
});
