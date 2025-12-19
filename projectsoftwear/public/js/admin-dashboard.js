$(document).ready(function () {
    const $addProductBtn = $('#add-product-btn');
    const $saveProductBtn = $('#save-product-btn');
    const $cancelAddProductBtn = $('#cancel-add-product-btn');
    const $addProductForm = $('#add-product-form');
    const $productList = $('#product-list');
    const $searchBar = $('#search-bar');
    const $priceFilter = $('#price-filter');
    const $quantityFilter = $('#quantity-filter');
    const $userName = $('#user-name');
    const $userRole = $('#user-role');
    const $profilePic = $('#profile-pic');

    let products = []; // Will hold products fetched from the API

    // Fetch user info (check if session exists)
    function fetchUserInfo() {
        return $.ajax({
            url: '/api/user', // Assuming this returns logged-in user's info
            method: 'GET',
            dataType: 'json',
        }).done(function (userInfo) {
            if (!userInfo) {
                window.location.href = '/login'; // Redirect to login if no session
                return;
            }

            const { username, role, profile_image } = userInfo;

            // Update the navigation bar with user details
            updateUserNavBar(username, role, profile_image);

            // Load the appropriate menu and page based on role
            loadMenu(role);

            // If the role is not 'admin', redirect to the user dashboard
            if (role !== 'admin') {
                window.location.href = '/user-dashboard'; // Redirect to user dashboard if role is not admin
                return;
            }

            // Fetch products from the API
            fetchProducts();
        }).fail(function () {
            console.error('Failed to initialize application');
        });
    }

    // Update user details in the top navigation bar
    function updateUserNavBar(username, role, photo) {
        $userName.text(username || 'Guest');
        $userRole.text(`(${role})`);
        $profilePic.attr('src', photo || 'default-profile.png');
    }

    // Load menu based on user role
    function loadMenu(role) {
        const menuFile = role === 'admin' || role === 'superadmin' ? 'admin-menu.html' : 'user-menu.html';
        $.ajax({
            url: menuFile,
            method: 'GET',
        })
        .done(function (data) {
            $('#menu-container').html(data);
            setupMenuListeners(role);
        })
        .fail(function () {
            console.error('Error loading menu');
            $('#menu-container').html('<p>Failed to load the menu. Please try again later.</p>');
        });
    }

    // Set up menu click listeners
    function setupMenuListeners(role) {
        const menuMapping = {
            'dashboard-menu-item': role === 'admin' || role === 'superadmin' ? 'admin-dashboard.html' : 'user-dashboard.html',
            'profile-menu-item': 'profile.html',
            'settings-menu-item': 'settings.html',
            'logout-menu-item': '/logout',
        };

        $.each(menuMapping, function (id, file) {
            const $item = $(`#${id}`);
            if ($item.length) {
                $item.on('click', function () {
                    if (file === '/logout') {
                        handleLogout();
                    } else {
                        loadPage(file, role);
                    }
                });
            }
        });
    }

    // Handle user logout
    function handleLogout() {
        $.ajax({
            url: '/logout',
            method: 'GET',
        })
        .done(function () {
            window.location.href = '/login'; // Redirect to login on successful logout
        })
        .fail(function () {
            console.error('Logout error');
            alert('An error occurred while logging out. Please try again.');
        });
    }

    // Open Add Product Form
    $addProductBtn.on('click', function () {
        $addProductForm.show();
    });

    // Close Add Product Form
    $cancelAddProductBtn.on('click', function () {
        $addProductForm.hide();
    });

    // Save Product (including image handling)
    $saveProductBtn.on('click', function (event) {
        event.preventDefault();

        const productName = $('#product-name').val();
        const productPrice = $('#product-price').val();
        const productQuantity = $('#product-quantity').val();
        const productImage = $('#product-image')[0].files[0];

        // Frontend Validation
        if (!productName || !productPrice || !productQuantity) {
            alert("All fields are required.");
            return;
        }

        if (isNaN(productPrice) || isNaN(productQuantity)) {
            alert("Price and Quantity must be valid numbers.");
            return;
        }

        const formData = new FormData();
        formData.append('name', productName);
        formData.append('price', productPrice);
        formData.append('quantity', productQuantity);
        formData.append('image', productImage);

        $.ajax({
            url: '/api/add-product', // The endpoint where you are posting the product data
            method: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            success: function (response) {
                const product = response.product;
                products.push(product); // Add the new product to the products list

                $addProductForm.hide();
                loadProductTable();

                alert(response.message); // "Product added successfully!"
            },
            error: function () {
                alert('Failed to save product.');
            }
        });
    });

    // Edit Product
    function editProduct(productId) {
        const product = products.find(p => p.id === productId);
        $('#product-name').val(product.name);
        $('#product-price').val(product.price);
        $('#product-quantity').val(product.quantity);
        $addProductForm.show();
    }

    // Delete Product
    function deleteProduct(productId) {
        $.ajax({
            url: `/api/products/${productId}`, // Ensure productId is correctly interpolated here
            method: 'DELETE',
            success: function () {
                products = products.filter(p => p.id !== productId);
                loadProductTable();
            },
            error: function (xhr, status, error) {
                console.error(`Failed to delete product. Status: ${status}, Error: ${error}`);
                alert('Failed to delete product.');
            }
        });
    }
    

    // Add click listeners for edit and delete buttons after loading the table
    function setupActionButtons() {
        $('.edit-btn').off('click').on('click', function () {
            const productId = $(this).data('id');
            editProduct(productId);
        });

        $('.delete-btn').off('click').on('click', function () {
            const productId = $(this).data('id');
            if (confirm('Are you sure you want to delete this product?')) {
                deleteProduct(productId);
            }
        });
    }

    // Load Product Table
    let currentPage = 1;
    const itemsPerPage = 7; // Number of products per page

    function loadProductTable() {
        $productList.empty();
        const filteredProducts = filterProducts(products);
        const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

        // Update Pagination Info
        $("#page-info").text(`Page ${currentPage} of ${totalPages}`);
        $("#prev-page").prop("disabled", currentPage === 1);
        $("#next-page").prop("disabled", currentPage === totalPages);

        // Get products for the current page
        const startIndex = (currentPage - 1) * itemsPerPage;
        const paginatedProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

        paginatedProducts.forEach((product) => {
            const row = $("<tr>");
            row.html(`
                <td>${product.id}</td>
                <td>${product.name}</td>
                <td>$${product.price}</td>
                <td>${product.quantity}</td>
                <td><img src="${product.image}" alt="${product.name}" width="50" height="50"></td>
                <td>
                    <button class="edit-btn" data-id="${product.id}">Edit</button>
                    <button class="delete-btn" data-id="${product.id}">Delete</button>
                </td>
            `);
            $productList.append(row);
        });

        // Setup action buttons
        setupActionButtons();
    }

    // Pagination Button Click Handlers
    $("#prev-page").on("click", function () {
        if (currentPage > 1) {
            currentPage--;
            loadProductTable();
        }
    });

    $("#next-page").on("click", function () {
        const totalPages = Math.ceil(filterProducts(products).length / itemsPerPage);
        if (currentPage < totalPages) {
            currentPage++;
            loadProductTable();
        }
    });

    // Filter Products based on search and filters
    function filterProducts(products) {
        let filteredProducts = products;

        const searchQuery = $searchBar.val().toLowerCase();
        if (searchQuery) {
            filteredProducts = filteredProducts.filter(product =>
                product.name.toLowerCase().includes(searchQuery)
            );
        }

        if ($priceFilter.val() === "low-high") {
            filteredProducts = filteredProducts.sort((a, b) => a.price - b.price);
        } else if ($priceFilter.val() === "high-low") {
            filteredProducts = filteredProducts.sort((a, b) => b.price - a.price);
        }

        if ($quantityFilter.val() === "in-stock") {
            filteredProducts = filteredProducts.filter(product => product.quantity > 0);
        } else if ($quantityFilter.val() === "out-of-stock") {
            filteredProducts = filteredProducts.filter(product => product.quantity === 0);
        }

        return filteredProducts;
    }

    // Event listeners for search and filter changes
    $searchBar.on('input', loadProductTable);
    $priceFilter.on('change', loadProductTable);
    $quantityFilter.on('change', loadProductTable);

    // Fetch products from the backend
    function fetchProducts() {
        $.ajax({
            url: '/api/products', // Endpoint to fetch products
            method: 'GET',
            dataType: 'json',
            success: function (response) {
                products = response.products;
                loadProductTable();
            },
            error: function () {
                alert('Failed to load products.');
            }
        });
    }

    // Initialize application by fetching user info
    fetchUserInfo();
});
