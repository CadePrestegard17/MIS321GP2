// Global test
console.log('DRIVER ROUTES SCRIPT LOADED');

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
    
    // Load driver routes
    loadDriverRoutes();
    
    // Set up refresh button
    const refreshBtn = document.getElementById('refresh-routes-btn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', handleRefreshRoutes);
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
    
    // Mock data for now - replace with actual API calls
    const mockRoutes = [
        {
            id: 1,
            status: 'pending',
            pickupLocation: 'Green Valley Farm',
            dropoffLocation: 'Community Food Bank',
            pickupTime: '2024-01-15 14:00',
            estimatedDuration: '45 min',
            distance: '12.5 miles',
            items: ['Fresh Vegetables - 50 lbs']
        },
        {
            id: 2,
            status: 'in-progress',
            pickupLocation: 'Downtown Bakery',
            dropoffLocation: 'Homeless Shelter',
            pickupTime: '2024-01-15 16:00',
            estimatedDuration: '30 min',
            distance: '8.2 miles',
            items: ['Bread & Pastries - 25 loaves']
        }
    ];
    
    displayRoutes(mockRoutes);
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
                    ${route.status === 'pending' ? 
                        `<button class="btn btn-primary btn-sm me-2" onclick="startRoute(${route.id})">
                            <i class="bi bi-play-circle me-1"></i>Start
                        </button>` : 
                        `<button class="btn btn-success btn-sm" onclick="completeRoute(${route.id})">
                            <i class="bi bi-check-circle me-1"></i>Complete
                        </button>`
                    }
                    <button class="btn btn-outline-secondary btn-sm" onclick="viewRouteDetails(${route.id})">
                        <i class="bi bi-eye me-1"></i>Details
                    </button>
                </div>
            </div>
        </div>
    `;
    
    return card;
}

function startRoute(routeId) {
    console.log('Starting route:', routeId);
    
    // TODO: Replace with actual API call
    // const response = await fetch(`/api/routes/${routeId}/start`, {
    //     method: 'POST'
    // });
    
    showToast('Route started successfully!', 'success');
    
    // Refresh routes
    loadDriverRoutes();
}

function completeRoute(routeId) {
    console.log('Completing route:', routeId);
    
    // TODO: Replace with actual API call
    // const response = await fetch(`/api/routes/${routeId}/complete`, {
    //     method: 'POST'
    // });
    
    showToast('Route completed successfully!', 'success');
    
    // Refresh routes
    loadDriverRoutes();
}

function viewRouteDetails(routeId) {
    console.log('Viewing route details:', routeId);
    
    // Navigate to route details page
    window.location.href = `driver-route-detail.html?id=${routeId}`;
}
