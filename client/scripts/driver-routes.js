// Global test
console.log('DRIVER ROUTES SCRIPT LOADED');

// Global state for filtering
let currentFilter = 'all';
let selectedCity = '';

// Make showRouteDetails globally accessible immediately
window.showRouteDetails = function(routeId) {
    console.log('showRouteDetails called with:', routeId);
    
    // Route data mapping
    const routeData = {
        'ROUTE-001': {
            id: 'ROUTE-001',
            status: 'Assigned',
            distance: '8.5 mi',
            duration: '25 min',
            priority: 'HIGH',
            pickupAddress: '123 Main St, Downtown',
            pickupOrg: 'Green Grocery Co.',
            dropoffAddress: 'Community Food Bank, 100 Help St',
            dropoffOrg: 'Community Food Bank',
            items: ['Fresh Organic Vegetables (25 lbs)'],
            driver: 'John Driver',
            estimatedArrival: '2:30 PM'
        },
        'ROUTE-002': {
            id: 'ROUTE-002',
            status: 'Available',
            distance: '6.2 mi',
            duration: '18 min',
            priority: 'MEDIUM',
            pickupAddress: '456 Oak Ave, Midtown',
            pickupOrg: 'Bakery Bliss',
            dropoffAddress: 'Hope Kitchen, 200 Care Blvd',
            dropoffOrg: 'Hope Kitchen',
            items: ['Artisan Bread (15 items)'],
            driver: 'Not assigned',
            estimatedArrival: '4:00 PM'
        }
    };
    
    const route = routeData[routeId];
    if (!route) {
        showToast('Route not found', 'danger');
        return;
    }
    
    // Populate modal
    const modalContent = document.getElementById('routeDetailsContent');
    const priorityClass = route.priority === 'HIGH' ? 'danger' : 'warning';
    
    modalContent.innerHTML = `
        <div class="row mb-3">
            <div class="col-md-6">
                <h6>Route Information</h6>
                <p><strong>Route ID:</strong> ${route.id}</p>
                <p><strong>Status:</strong> <span class="badge bg-${route.status === 'Assigned' ? 'warning' : 'success'}">${route.status}</span></p>
                <p><strong>Priority:</strong> <span class="badge bg-${priorityClass}">${route.priority}</span></p>
                <p><strong>Driver:</strong> ${route.driver}</p>
            </div>
            <div class="col-md-6">
                <h6>Route Metrics</h6>
                <p><strong>Distance:</strong> ${route.distance}</p>
                <p><strong>Estimated Duration:</strong> ${route.duration}</p>
                <p><strong>Estimated Arrival:</strong> ${route.estimatedArrival}</p>
            </div>
        </div>
        
        <div class="row">
            <div class="col-12">
                <h6 class="border-bottom pb-2 mb-3">Pickup Location</h6>
                <p><i class="bi bi-geo-alt-fill text-danger me-2"></i><strong>${route.pickupOrg}</strong></p>
                <p class="text-muted">${route.pickupAddress}</p>
                
                <h6 class="border-bottom pb-2 mb-3 mt-4">Drop-off Location</h6>
                <p><i class="bi bi-house-fill text-success me-2"></i><strong>${route.dropoffOrg}</strong></p>
                <p class="text-muted">${route.dropoffAddress}</p>
                
                <h6 class="border-bottom pb-2 mb-3 mt-4">Items</h6>
                <ul>
                    ${route.items.map(item => `<li>${item}</li>`).join('')}
                </ul>
            </div>
        </div>
    `;
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('routeDetailsModal'));
    modal.show();
};

// Driver routes page specific functionality
document.addEventListener('DOMContentLoaded', function() {
    console.log('Driver routes page loaded');
    
    // Load routes directly (will show city input if no city selected)
    loadDriverRoutes();
    
    // Set up refresh button
    const refreshBtn = document.getElementById('refresh-routes-btn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', handleRefreshRoutes);
    }
    
    // Set up my routes button
    const myRoutesBtn = document.getElementById('my-routes-btn');
    if (myRoutesBtn) {
        myRoutesBtn.addEventListener('click', showMyRoutes);
    }
    
    // Set up filter options
    const filterOptions = document.querySelectorAll('.filter-option');
    filterOptions.forEach(option => {
        option.addEventListener('click', function(e) {
            e.preventDefault();
            const filter = this.getAttribute('data-filter');
            applyRouteFilter(filter);
        });
    });
    
    // Set up start route buttons
    const startRouteBtns = document.querySelectorAll('.start-route-btn');
    startRouteBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const routeId = this.getAttribute('data-route-id');
            console.log('Start Route clicked for:', routeId);
            handleStartRoute(routeId, this);
        });
    });
});

function handleRefreshRoutes() {
    console.log('Refreshing routes...');
    showToast('Refreshing routes...', 'info');
    
    // Simulate a refresh delay
    setTimeout(() => {
        location.reload();
    }, 500);
}

function applyRouteFilter(filter) {
    console.log('Applying filter:', filter);
    
    // Update filter button text
    const filterBtn = document.getElementById('filter-routes-btn');
    const filterOptions = document.querySelectorAll('.filter-option');
    filterOptions.forEach(option => {
        const optionFilter = option.getAttribute('data-filter');
        if (optionFilter === filter) {
            filterBtn.innerHTML = `<i class="bi bi-funnel me-1"></i>Filter: ${option.textContent}`;
        }
    });
    
    // Get all route cards
    const routeCards = document.querySelectorAll('.route-stop');
    let visibleCount = 0;
    
    routeCards.forEach(card => {
        let shouldShow = true;
        
        if (filter === 'all') {
            shouldShow = true;
        } else if (filter === 'high') {
            const priorityBadge = card.querySelector('.badge.bg-danger');
            shouldShow = priorityBadge !== null;
        } else if (filter === 'medium') {
            const priorityBadge = card.querySelector('.badge.bg-warning');
            shouldShow = priorityBadge !== null;
        } else if (filter === 'low') {
            const priorityBadge = card.querySelector('.badge.bg-info, .badge.bg-secondary');
            shouldShow = priorityBadge !== null;
        }
        
        if (shouldShow) {
            card.style.display = '';
            visibleCount++;
        } else {
            card.style.display = 'none';
        }
    });
    
    showToast(`Showing ${visibleCount} routes`, 'success');
}

function handleStartRoute(routeId, buttonElement) {
    console.log('Starting route:', routeId);
    
    // Update button text and style
    buttonElement.innerHTML = '<i class="bi bi-check-circle me-1"></i>Already Assigned';
    buttonElement.className = 'btn btn-secondary btn-sm';
    buttonElement.disabled = true;
    
    // Show success message
    showToast(`Route ${routeId} started successfully!`, 'success');
    
    // TODO: Replace with actual API call
    // const response = await fetch(`/api/routes/${routeId}/start`, {
    //     method: 'POST'
    // });
}

function loadDriverRoutes() {
    console.log('Loading driver routes...');
    
    // Check if city is selected
    if (!selectedCity) {
        showCityInputPrompt();
        return;
    }
    
    // Load routes based on selected city
    loadLocationBasedRoutes();
}

async function loadLocationBasedRoutes() {
    try {
        // Get claimed donations that drivers can pick up
        const response = await fetch('/api/donation/claimed-for-drivers');
        const result = await response.json();
        
        if (result.donations) {
            // Filter donations based on selected city
            const relevantDonations = filterDonationsByLocation(result.donations);
            
            // Convert donations to route format
            const routes = convertDonationsToRoutes(relevantDonations);
            
            displayRoutes(routes);
        } else {
            console.error('Failed to load donations:', result);
            showToast('Failed to load routes', 'danger');
        }
    } catch (error) {
        console.error('Error loading routes:', error);
        showToast('An error occurred while loading routes', 'danger');
    }
}

function filterDonationsByLocation(donations) {
    if (!selectedCity) return donations;
    
    return donations.filter(donation => {
        // Check if donation city matches selected city
        const donationCity = extractCityFromAddress(donation.address);
        if (donationCity && donationCity.toLowerCase().includes(selectedCity.toLowerCase())) {
            return true;
        }
        
        return false;
    });
}

function extractCityFromAddress(address) {
    // Simple city extraction - in production, use proper geocoding
    const parts = address.split(',');
    if (parts.length >= 2) {
        return parts[1].trim();
    }
    return null;
}

function convertDonationsToRoutes(donations) {
    return donations.map(donation => ({
        id: donation.id,
        status: 'available',
        pickupLocation: donation.address,
        dropoffLocation: 'Community Food Bank', // Default dropoff
        pickupTime: donation.pickupStart,
        estimatedDuration: calculateEstimatedDuration(donation),
        distance: calculateDistance(donation),
        items: [`${donation.itemName} - ${donation.quantity}`],
        donor: donation.donor,
        priority: determinePriority(donation)
    }));
}

function calculateEstimatedDuration(donation) {
    // Simple duration calculation based on distance
    const distance = calculateDistance(donation);
    const baseTime = 15; // 15 minutes base
    const timePerMile = 2; // 2 minutes per mile
    return `${baseTime + (distance * timePerMile)} min`;
}

function calculateDistance(donation) {
    // Mock distance calculation - in production, use geocoding
    return Math.floor(Math.random() * 20) + 5; // 5-25 miles
}

function determinePriority(donation) {
    // Determine priority based on safe until date
    const safeUntil = new Date(donation.safeUntil);
    const now = new Date();
    const hoursUntilExpiry = (safeUntil - now) / (1000 * 60 * 60);
    
    if (hoursUntilExpiry < 24) return 'HIGH';
    if (hoursUntilExpiry < 48) return 'MEDIUM';
    return 'LOW';
}

function showToast(message, type = 'info') {
    // Create toast element
    const toastDiv = document.createElement('div');
    toastDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
    toastDiv.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    toastDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(toastDiv);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (toastDiv.parentNode) {
            toastDiv.parentNode.removeChild(toastDiv);
        }
    }, 5000);
}

function showCityInputPrompt() {
    const routesContainer = document.getElementById('routes-container');
    if (!routesContainer) {
        console.error('Routes container not found');
        return;
    }
    
    routesContainer.innerHTML = `
        <div class="text-center py-5">
            <div class="card border-primary">
                <div class="card-body">
                    <i class="bi bi-geo-alt text-primary" style="font-size: 3rem;"></i>
                    <h4 class="mt-3 text-primary">Select Your City</h4>
                    <p class="text-muted">Enter the city where you want to pick up donations</p>
                    <div class="row justify-content-center mt-4">
                        <div class="col-md-6">
                            <div class="input-group">
                                <input type="text" class="form-control" id="city-input" placeholder="e.g., Tuscaloosa" />
                                <button class="btn btn-primary" type="button" onclick="setCityAndLoadRoutes()">
                                    <i class="bi bi-search me-1"></i>Find Routes
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function setCityAndLoadRoutes() {
    const cityInput = document.getElementById('city-input');
    if (!cityInput || !cityInput.value.trim()) {
        showToast('Please enter a city name', 'warning');
        return;
    }
    
    selectedCity = cityInput.value.trim();
    console.log('Selected city:', selectedCity);
    
    showToast(`Loading routes for ${selectedCity}...`, 'info');
    loadDriverRoutes();
}

function displayRoutes(routes) {
    const routesContainer = document.getElementById('routes-container');
    if (!routesContainer) return;
    
    routesContainer.innerHTML = '';
    
    routes.forEach(route => {
        const routeCard = createRouteCard(route);
        routesContainer.appendChild(routeCard);
    });
}

function createRouteCard(route) {
    const statusClass = route.status === 'pending' ? 'warning' : 
                       route.status === 'in-progress' ? 'primary' : 'success';
    
    const card = document.createElement('div');
    card.className = 'card mb-3';
    card.setAttribute('data-route-id', route.id);
    card.innerHTML = `
        <div class="card-body">
            <div class="d-flex justify-content-between align-items-start">
                <div>
                    <h5 class="card-title">
                        Route #${route.id}
                        <span class="badge bg-${statusClass} ms-2">${route.status}</span>
                    </h5>
                    <div class="row">
                        <div class="col-md-6">
                            <p class="mb-1">
                                <i class="bi bi-geo-alt-fill text-danger me-1"></i>
                                <strong>Pickup:</strong> ${route.pickupLocation}
                            </p>
                            <p class="mb-1">
                                <i class="bi bi-geo-alt-fill text-success me-1"></i>
                                <strong>Dropoff:</strong> ${route.dropoffLocation}
                            </p>
                        </div>
                        <div class="col-md-6">
                            <p class="mb-1">
                                <i class="bi bi-clock me-1"></i>
                                <strong>Time:</strong> ${route.pickupTime}
                            </p>
                            <p class="mb-1">
                                <i class="bi bi-speedometer2 me-1"></i>
                                <strong>Distance:</strong> ${route.distance}
                            </p>
                        </div>
                    </div>
                    <div class="mt-2">
                        <small class="text-muted">
                            <i class="bi bi-box me-1"></i>
                            <strong>Items:</strong> ${route.items.join(', ')}
                        </small>
                    </div>
                </div>
                <div class="text-end">
                    <button class="btn btn-primary btn-sm me-2" onclick="claimRoute(${route.id})">
                        <i class="bi bi-hand-thumbs-up me-1"></i>Claim Route
                    </button>
                    <button class="btn btn-outline-secondary btn-sm" onclick="viewRouteDetails(${route.id})">
                        <i class="bi bi-eye me-1"></i>Details
                    </button>
                </div>
            </div>
        </div>
    `;
    
    return card;
}

async function claimRoute(routeId) {
    try {
        console.log('Claiming route:', routeId);
        
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        if (!currentUser.id) {
            showToast('Please log in to claim routes', 'warning');
            return;
        }
        
        const response = await fetch(`/api/donation/${routeId}/assign-driver`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                driverId: currentUser.id
            })
        });
        
        if (response.ok) {
            showToast('Route claimed successfully!', 'success');
            // Remove the claimed route from the display
            removeRouteFromDisplay(routeId);
            // Add to my routes
            addToMyRoutes(routeId);
        } else {
            const error = await response.json();
            showToast(`Failed to claim route: ${error.message || 'Unknown error'}`, 'danger');
        }
    } catch (error) {
        console.error('Error claiming route:', error);
        showToast('Failed to claim route. Please try again.', 'danger');
    }
}

function removeRouteFromDisplay(routeId) {
    const routesContainer = document.getElementById('routes-container');
    if (!routesContainer) return;
    
    const routeCard = routesContainer.querySelector(`[data-route-id="${routeId}"]`);
    if (routeCard) {
        routeCard.remove();
    }
}

function addToMyRoutes(routeId) {
    // Store claimed route in localStorage for "My Routes" tab
    const myRoutes = JSON.parse(localStorage.getItem('myRoutes') || '[]');
    myRoutes.push(routeId);
    localStorage.setItem('myRoutes', JSON.stringify(myRoutes));
}

function showMyRoutes() {
    const myRoutes = JSON.parse(localStorage.getItem('myRoutes') || '[]');
    const routesContainer = document.getElementById('routes-container');
    
    if (!routesContainer) return;
    
    if (myRoutes.length === 0) {
        routesContainer.innerHTML = `
            <div class="col-12">
                <div class="card">
                    <div class="card-body text-center">
                        <h5 class="card-title">
                            <i class="bi bi-inbox me-2"></i>No Claimed Routes
                        </h5>
                        <p class="card-text text-muted">
                            You haven't claimed any routes yet. Browse available routes and claim them to see them here.
                        </p>
                        <button class="btn btn-primary" onclick="loadDriverRoutes()">
                            <i class="bi bi-arrow-left me-1"></i>Back to Available Routes
                        </button>
                    </div>
                </div>
            </div>
        `;
        return;
    }
    
    // Load claimed routes
    loadMyRoutes(myRoutes);
}

async function loadMyRoutes(routeIds) {
    try {
        const routesContainer = document.getElementById('routes-container');
        routesContainer.innerHTML = '<div class="col-12"><div class="text-center"><div class="spinner-border" role="status"><span class="visually-hidden">Loading...</span></div></div></div>';
        
        // Fetch details for each claimed route
        const routePromises = routeIds.map(async (routeId) => {
            const response = await fetch(`/api/donation/${routeId}`);
            if (response.ok) {
                return await response.json();
            }
            return null;
        });
        
        const routes = (await Promise.all(routePromises)).filter(route => route !== null);
        
        if (routes.length === 0) {
            routesContainer.innerHTML = `
                <div class="col-12">
                    <div class="card">
                        <div class="card-body text-center">
                            <h5 class="card-title">No Routes Found</h5>
                            <p class="card-text text-muted">Unable to load your claimed routes.</p>
                        </div>
                    </div>
                </div>
            `;
            return;
        }
        
        // Display claimed routes
        routesContainer.innerHTML = '';
        routes.forEach(route => {
            const routeCard = createMyRouteCard(route);
            routesContainer.appendChild(routeCard);
        });
        
    } catch (error) {
        console.error('Error loading my routes:', error);
        showToast('Failed to load your routes', 'danger');
    }
}

function createMyRouteCard(route) {
    const card = document.createElement('div');
    card.className = 'card mb-3';
    card.setAttribute('data-route-id', route.id);
    
    const pickupTime = new Date(route.pickupStart).toLocaleString();
    const safeUntil = new Date(route.safeUntil).toLocaleString();
    
    card.innerHTML = `
        <div class="card-body">
            <div class="d-flex justify-content-between align-items-start">
                <div>
                    <h5 class="card-title">
                        ${route.itemName}
                        <span class="badge bg-success ms-2">Claimed</span>
                    </h5>
                    <div class="row">
                        <div class="col-md-6">
                            <p class="mb-1">
                                <i class="bi bi-geo-alt-fill text-danger me-1"></i>
                                <strong>Pickup:</strong> ${route.address}
                            </p>
                            <p class="mb-1">
                                <i class="bi bi-clock me-1"></i>
                                <strong>Pickup Time:</strong> ${pickupTime}
                            </p>
                        </div>
                        <div class="col-md-6">
                            <p class="mb-1">
                                <i class="bi bi-box me-1"></i>
                                <strong>Quantity:</strong> ${route.quantity}
                            </p>
                            <p class="mb-1">
                                <i class="bi bi-calendar-check me-1"></i>
                                <strong>Safe Until:</strong> ${safeUntil}
                            </p>
                        </div>
                    </div>
                    ${route.notes ? `<div class="mt-2"><small class="text-muted"><strong>Notes:</strong> ${route.notes}</small></div>` : ''}
                </div>
                <div class="text-end">
                    <button class="btn btn-primary btn-sm me-2" onclick="viewRouteMap(${route.id})">
                        <i class="bi bi-map me-1"></i>View Map
                    </button>
                    <button class="btn btn-outline-secondary btn-sm" onclick="viewRouteDetails(${route.id})">
                        <i class="bi bi-eye me-1"></i>Details
                    </button>
                </div>
            </div>
        </div>
    `;
    
    return card;
}

function viewRouteMap(routeId) {
    // TODO: Implement map view
    showToast('Map view coming soon!', 'info');
}

function viewRouteDetails(routeId) {
    console.log('Viewing route details:', routeId);
    
    // Navigate to route details page
    window.location.href = `driver-route-detail.html?id=${routeId}`;
}
