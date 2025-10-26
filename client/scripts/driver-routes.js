// Driver routes page specific functionality
document.addEventListener('DOMContentLoaded', function() {
    console.log('Driver routes page loaded');
    
    // Load driver routes
    loadDriverRoutes();
    
    // Set up refresh functionality
    const refreshBtn = document.getElementById('refresh-routes');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', loadDriverRoutes);
    }
});

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
