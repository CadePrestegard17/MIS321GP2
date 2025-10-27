// Dashboard page specific functionality
let currentPeriod = 'week';

console.log('Dashboard script loaded');

document.addEventListener('DOMContentLoaded', function() {
    console.log('Dashboard page loaded');
    
    // Load dashboard data
    loadDashboardData();
    
    // Set up refresh functionality
    const refreshBtn = document.getElementById('refresh-dashboard');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', loadDashboardData);
    }
    
    // Set up period button listeners
    const periodButtons = document.querySelectorAll('.period-btn');
    console.log('Found period buttons:', periodButtons.length);
    
    periodButtons.forEach(button => {
        console.log('Adding listener to button:', button.getAttribute('data-period'));
        button.addEventListener('click', function() {
            console.log('Period button clicked:', this.getAttribute('data-period'));
            const period = this.getAttribute('data-period');
            updatePeriod(period);
        });
    });
});

function loadDashboardData() {
    console.log('Loading dashboard data for period:', currentPeriod);
    
    // Different mock data based on period
    const mockData = getMockDataForPeriod(currentPeriod);
    
    updateDashboardMetrics(mockData);
}

function getMockDataForPeriod(period) {
    // Return different data based on the selected time period
    switch(period) {
        case 'today':
            return {
                meals: 128,
                waste: 287,
                co2: 142,
                donors: 5,
                change: '+3% from yesterday'
            };
        case 'week':
            return {
                meals: 1251,
                waste: 2847,
                co2: 1423,
                donors: 47,
                change: '+12% from last week'
            };
        case 'month':
            return {
                meals: 5820,
                waste: 12450,
                co2: 6215,
                donors: 203,
                change: '+18% from last month'
            };
        default:
            return {
                meals: 1251,
                waste: 2847,
                co2: 1423,
                donors: 47,
                change: '+12% from last week'
            };
    }
}

function selectPeriod(period) {
    console.log('selectPeriod called with:', period);
    updatePeriod(period);
}

function updatePeriod(period) {
    console.log('Updating period to:', period);
    currentPeriod = period;
    
    // Update button states
    const periodButtons = document.querySelectorAll('.period-btn');
    periodButtons.forEach(button => {
        if (button.getAttribute('data-period') === period) {
            button.classList.remove('btn-outline-primary');
            button.classList.add('btn-primary', 'active');
        } else {
            button.classList.remove('btn-primary', 'active');
            button.classList.add('btn-outline-primary');
        }
    });
    
    // Reload data for the new period
    loadDashboardData();
}

// Make function globally available
window.selectPeriod = selectPeriod;

function updateDashboardMetrics(data) {
    // Update KPI cards
    const kpiCards = document.querySelectorAll('.kpi-card');
    
    kpiCards.forEach((card, index) => {
        const kpiValue = card.querySelector('.kpi-value');
        const changeText = card.querySelector('small.opacity-75');
        
        if (kpiValue && changeText) {
            switch(index) {
                case 0: // Meals
                    kpiValue.textContent = data.meals.toLocaleString();
                    changeText.textContent = data.change;
                    break;
                case 1: // Waste
                    kpiValue.textContent = data.waste.toLocaleString();
                    changeText.textContent = data.change;
                    break;
                case 2: // CO2
                    kpiValue.textContent = data.co2.toLocaleString();
                    // Keep original text for CO2
                    break;
                case 3: // Donors
                    kpiValue.textContent = data.donors.toLocaleString();
                    // Keep original text for Donors
                    break;
            }
        }
    });
}
