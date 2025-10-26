// Dashboard page specific functionality
document.addEventListener('DOMContentLoaded', function() {
    console.log('Dashboard page loaded');
    
    // Load dashboard data
    loadDashboardData();
    
    // Set up refresh functionality
    const refreshBtn = document.getElementById('refresh-dashboard');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', loadDashboardData);
    }
});

function loadDashboardData() {
    console.log('Loading dashboard data...');
    
    // Mock data for now - replace with actual API calls
    const mockData = {
        totalMeals: 1250,
        totalDonations: 89,
        activeDrivers: 12,
        activeNonprofits: 8,
        wasteDiverted: 450, // kg
        co2Saved: 1200 // kg
    };
    
    updateDashboardMetrics(mockData);
}

function updateDashboardMetrics(data) {
    // Update metric cards
    const elements = {
        'total-meals': data.totalMeals,
        'total-donations': data.totalDonations,
        'active-drivers': data.activeDrivers,
        'active-nonprofits': data.activeNonprofits,
        'waste-diverted': data.wasteDiverted,
        'co2-saved': data.co2Saved
    };
    
    Object.entries(elements).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value.toLocaleString();
        }
    });
}
