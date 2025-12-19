$(document).ready(function () {
    const $menuIcon = $('#menu-icon');
    const $closeButton = $('#close-btn');
    const $sidebar = $('#sidebar');
    const $menuContainer = $('#menu-container');
    const $mainContent = $('#main-content');
    const $spinner = $('#loading-spinner');
    const pageCache = new Map();

    // Fetch user info (check if session exists)
    function fetchUserInfo() {
        return $.ajax({
            url: '/api/user',  // Adjust this API endpoint according to your server logic
            method: 'GET',
            dataType: 'json',
        }).fail(function () {
            window.location.href = '/login'; // Redirect to login if no session
        });
    }

    // Load the appropriate menu based on the user role
    function loadMenu(role) {
        const menuFile = role === 'admin' || role === 'superadmin' ? 'admin-menu.html' : 'user-menu.html';
        $.ajax({
            url: menuFile,
            method: 'GET',
        })
            .done(function (data) {
                $menuContainer.html(data);
                setupMenuListeners(role);
            })
            .fail(function () {
                console.error('Error loading menu');
                $menuContainer.html('<p>Failed to load the menu. Please try again later.</p>');
            });
    }

    // Set up menu click listeners
    function setupMenuListeners(role) {
        const menuMapping = {
            'dashboard-menu-item': role === 'admin' ? 'admin-dashboard.html' : 'user-dashboard.html',
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

    // Load pages based on the role and cache them
    function loadPage(pageFile, role) {
        // Show spinner before loading content
        $spinner.show();

        // Check for admin access
        if (pageFile === 'admin-dashboard.html' && role !== 'admin' && role !== 'superadmin') {
            $mainContent.html('<h2>Access Denied: Admins Only</h2>');
            $spinner.hide();
            return;
        }

        // Check if the content is cached
        if (pageCache.has(pageFile)) {
            renderContent(pageCache.get(pageFile));
            return;
        }

        // Fetch the content via AJAX
        $.ajax({
            url: pageFile,
            method: 'GET',
            dataType: 'html', // Ensure content is HTML
        })
            .done(function (data) {
                // Cache and render the content
                pageCache.set(pageFile, data);
                renderContent(data);
            })
            .fail(function (jqXHR, textStatus, errorThrown) {
                // Log and display error message
                console.error(`Failed to load page: ${textStatus} - ${errorThrown}`);
                renderContent('<h2>Error: Unable to load content. Please try again later.</h2>');
            })
            .always(function () {
                $spinner.hide(); // Always hide spinner
            });

        // Helper function to render content
        function renderContent(content) {
            $mainContent.html(content);
        }
    }

    // Handle user logout
    function handleLogout() {
        $.ajax({
            url: '/logout',
            method: 'GET', // Use GET for logout as per server.js
        })
            .done(function () {
                window.location.href = '/login'; // Redirect to login on successful logout
            })
            .fail(function () {
                console.error('Logout error');
                alert('An error occurred while logging out. Please try again.');
            });
    }

    // Update user details in the top navigation bar
    function updateUserNavBar(username, role, photo) {
        $('#user-name').text(username || 'Guest');
        $('#user-role').text(`(${role})`);
        $('#profile-pic').attr('src', photo || 'default-profile.png');
    }
    
    // Sidebar toggle functionality
    $menuIcon.on('click', function () {
        $sidebar.addClass('show');
    });
    
    $closeButton.on('click', function () {
        $sidebar.removeClass('show');
    });

    // App Initialization
    function initialize() {
        fetchUserInfo()
            .done(function (userInfo) {
                if (!userInfo) return;

                const { username, role, profile_image } = userInfo;

                // Update the navigation bar with user details
                updateUserNavBar(username, role, profile_image);

                // Load the appropriate menu
                loadMenu(role);

                // Load the initial page based on the role
                if (role === 'admin' || role === 'superadmin') {
                    window.location.href = 'admin-dashboard.html';  // Redirect to admin dashboard
                } else {
                    window.location.href = 'user-dashboard.html';  // Redirect to user dashboard
                }
            })
            .fail(function () {
                console.error('Failed to initialize application');
            });
    }

    initialize(); // Start the application
});