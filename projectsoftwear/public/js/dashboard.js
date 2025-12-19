document.addEventListener("DOMContentLoaded", function () {
    // Fake API or Database Call Simulation
    fetchDashboardData();
});

function fetchDashboardData() {
    const loadingSpinner = document.getElementById("loading-spinner");
    loadingSpinner.style.display = "block";

    // Simulate a database fetch
    setTimeout(() => {
        const data = {
            totalEquipment: 120,
            totalCategories: 15,
            totalSuppliers: 8,
            totalOrders: 45,
        };

        document.getElementById("total-equipment").innerText = data.totalEquipment;
        document.getElementById("total-categories").innerText = data.totalCategories;
        document.getElementById("total-suppliers").innerText = data.totalSuppliers;
        document.getElementById("total-orders").innerText = data.totalOrders;

        loadingSpinner.style.display = "none";
    }, 1000);
}

// Sidebar Toggle
function toggleSidebar() {
    document.getElementById("sidebar").classList.toggle("show");
}

// Logout Functionality
function logout() {
    window.location.href = "login.html"; // Redirect to login page
}
