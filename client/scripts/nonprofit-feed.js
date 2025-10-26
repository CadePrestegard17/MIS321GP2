// Nonprofit feed page specific functionality
document.addEventListener('DOMContentLoaded', function() {
    console.log('Nonprofit feed page loaded');
    
    // Load available donations
    loadAvailableDonations();
    
    // Set up filters
    initializeFilters();
    
    // Set up refresh functionality
    const refreshBtn = document.getElementById('refresh-feed');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', loadAvailableDonations);
    }
});

function initializeFilters() {
    const categoryFilter = document.getElementById('category-filter');
    const distanceFilter = document.getElementById('distance-filter');
    
    if (categoryFilter) {
        categoryFilter.addEventListener('change', filterDonations);
    }
    
    if (distanceFilter) {
        distanceFilter.addEventListener('change', filterDonations);
    }
}

function loadAvailableDonations() {
    console.log('Loading available donations...');
    
    // Mock data for now - replace with actual API calls
    const mockDonations = [
        {
            id: 1,
            title: 'Fresh Vegetables',
            description: 'Mixed vegetables from local farm',
            category: 'Produce',
            quantity: 50,
            unit: 'lbs',
            pickupDate: '2024-01-15',
            pickupTime: '14:00',
            distance: '2.3 miles',
            donor: 'Green Valley Farm'
        },
        {
            id: 2,
            title: 'Bread & Pastries',
            description: 'Day-old bread and pastries',
            category: 'Bakery',
            quantity: 25,
            unit: 'loaves',
            pickupDate: '2024-01-15',
            pickupTime: '16:00',
            distance: '1.8 miles',
            donor: 'Downtown Bakery'
        }
    ];
    
    displayDonations(mockDonations);
}

function displayDonations(donations) {
    const feedContainer = document.getElementById('donations-feed');
    if (!feedContainer) return;
    
    feedContainer.innerHTML = '';
    
    donations.forEach(donation => {
        const donationCard = createDonationCard(donation);
        feedContainer.appendChild(donationCard);
    });
}

function createDonationCard(donation) {
    const card = document.createElement('div');
    card.className = 'card mb-3';
    card.innerHTML = `
        <div class="card-body">
            <div class="d-flex justify-content-between align-items-start">
                <div>
                    <h5 class="card-title">${donation.title}</h5>
                    <p class="card-text">${donation.description}</p>
                    <div class="row">
                        <div class="col-md-6">
                            <small class="text-muted">
                                <i class="bi bi-tag me-1"></i>${donation.category}
                            </small>
                        </div>
                        <div class="col-md-6">
                            <small class="text-muted">
                                <i class="bi bi-rulers me-1"></i>${donation.quantity} ${donation.unit}
                            </small>
                        </div>
                    </div>
                    <div class="row mt-2">
                        <div class="col-md-6">
                            <small class="text-muted">
                                <i class="bi bi-calendar me-1"></i>${donation.pickupDate} at ${donation.pickupTime}
                            </small>
                        </div>
                        <div class="col-md-6">
                            <small class="text-muted">
                                <i class="bi bi-geo-alt me-1"></i>${donation.distance}
                            </small>
                        </div>
                    </div>
                </div>
                <div class="text-end">
                    <button class="btn btn-success btn-sm" onclick="claimDonation(${donation.id})">
                        <i class="bi bi-check-circle me-1"></i>Claim
                    </button>
                </div>
            </div>
        </div>
    `;
    
    return card;
}

function claimDonation(donationId) {
    console.log('Claiming donation:', donationId);
    
    // TODO: Replace with actual API call
    // const response = await fetch(`/api/donations/${donationId}/claim`, {
    //     method: 'POST'
    // });
    
    showToast('Donation claimed successfully!', 'success');
    
    // Refresh the feed
    loadAvailableDonations();
}

function filterDonations() {
    // TODO: Implement filtering logic
    console.log('Filtering donations...');
}
