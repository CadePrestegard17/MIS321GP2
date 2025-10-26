// Nonprofit Feed Page JavaScript
console.log('Nonprofit feed page loaded');

// Initialize the feed
document.addEventListener('DOMContentLoaded', function() {
    initializeFeed();
});

function initializeFeed() {
    loadDonations();
    
    // Set up refresh button
    const refreshBtn = document.querySelector('.btn-outline-primary');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', loadDonations);
    }
    
    // Set up claim buttons
    document.addEventListener('click', function(event) {
        if (event.target.classList.contains('claim-btn')) {
            const donationId = event.target.getAttribute('data-donation-id');
            claimDonation(donationId);
        }
    });
    
    // Auto-refresh every 30 seconds
    setInterval(loadDonations, 30000);
}

async function loadDonations() {
    try {
        const response = await fetch('/api/donation');
        const result = await response.json();
        
        if (result.donations) {
            displayDonations(result.donations);
            updateStats(result.donations);
            updateLastUpdated();
        } else {
            console.error('Failed to load donations:', result);
            showAlert('Failed to load donations', 'danger');
        }
    } catch (error) {
        console.error('Error loading donations:', error);
        showAlert('An error occurred while loading donations', 'danger');
    }
}

function displayDonations(donations) {
    const feedContainer = document.querySelector('.donations-feed');
    if (!feedContainer) return;
    
    // Clear existing donations
    feedContainer.innerHTML = '';
    
    if (donations.length === 0) {
        feedContainer.innerHTML = `
            <div class="card">
                <div class="card-body text-center py-5">
                    <i class="bi bi-inbox fs-1 text-muted mb-3"></i>
                    <h5 class="text-muted">No donations available</h5>
                    <p class="text-muted">Check back later for new donations!</p>
                </div>
            </div>
        `;
        return;
    }
    
    donations.forEach(donation => {
        const donationCard = createDonationCard(donation);
        feedContainer.appendChild(donationCard);
    });
}

function createDonationCard(donation) {
    const card = document.createElement('div');
    card.className = 'card donation-card mb-3';
    card.setAttribute('data-donation-id', donation.id);
    
    const statusClass = getStatusClass(donation.status);
    const statusText = getStatusText(donation.status);
    const timeInfo = getTimeInfo(donation);
    const donorName = donation.Donor ? `${donation.Donor.FirstName} ${donation.Donor.LastName}` : 'Anonymous Donor';
    
    card.innerHTML = `
        <div class="card-body">
            <div class="d-flex justify-content-between align-items-start mb-2">
                <h6 class="card-title mb-0">${donation.itemName}</h6>
                <span class="badge status-badge ${statusClass}">${statusText}</span>
            </div>
            <div class="row">
                <div class="col-md-8">
                    <p class="card-text">
                        <strong>${donation.category}</strong> • ${donation.quantity}<br>
                        <small class="text-muted">${donorName} • ${getDistanceText()}</small>
                    </p>
                    <p class="card-text">
                        <small class="text-muted">
                            📍 ${formatAddress(donation.address)}<br>
                            ⏰ ${timeInfo}
                        </small>
                    </p>
                    ${donation.notes ? `<p class="card-text"><small class="text-muted">${donation.notes}</small></p>` : ''}
                </div>
                <div class="col-md-4 text-end">
                    ${getActionButton(donation)}
                </div>
            </div>
        </div>
    `;
    
    return card;
}

function getStatusClass(status) {
    switch (status) {
        case 'open': return 'status-open';
        case 'claimed': return 'status-claimed';
        case 'picked_up': return 'status-picked-up';
        case 'expired': return 'status-expired';
        default: return 'status-open';
    }
}

function getStatusText(status) {
    switch (status) {
        case 'open': return 'Open';
        case 'claimed': return 'Claimed';
        case 'picked_up': return 'Picked Up';
        case 'expired': return 'Expired';
        default: return 'Open';
    }
}

function getTimeInfo(donation) {
    const now = new Date();
    const safeUntil = new Date(donation.safeUntil);
    const timeDiff = safeUntil.getTime() - now.getTime();
    
    if (timeDiff <= 0) {
        return 'Expired';
    }
    
    const hours = Math.floor(timeDiff / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
        return `Safe for ${hours}h ${minutes}m`;
    } else {
        return `Safe for ${minutes}m`;
    }
}

function formatAddress(addressString) {
    // Parse the combined address string back into components
    // Format: "123 Main St, City, State ZIP, Country"
    const parts = addressString.split(', ');
    if (parts.length >= 4) {
        const street = parts[0];
        const city = parts[1];
        const stateZip = parts[2];
        const country = parts[3];
        
        return `${street}<br>${city}, ${stateZip}<br>${country}`;
    }
    
    // Fallback to original format if parsing fails
    return addressString;
}

function getDistanceText() {
    // Mock distance calculation
    const distances = ['0.5 mi', '1.2 mi', '2.1 mi', '3.5 mi', '4.8 mi'];
    return distances[Math.floor(Math.random() * distances.length)];
}

function getActionButton(donation) {
    switch (donation.status) {
        case 'open':
            return `<button class="btn btn-primary btn-sm claim-btn" data-donation-id="${donation.id}">Claim</button>`;
        case 'claimed':
            return `<small class="text-muted">Claimed by ${donation.ClaimedBy ? (donation.ClaimedBy.FirstName + ' ' + donation.ClaimedBy.LastName) : 'Another nonprofit'}</small>`;
        case 'picked_up':
            return `<small class="text-muted">In transit${donation.AssignedDriver ? ' with ' + donation.AssignedDriver.FirstName : ''}</small>`;
        case 'expired':
            return `<small class="text-muted">No longer available</small>`;
        default:
            return `<button class="btn btn-primary btn-sm claim-btn" data-donation-id="${donation.id}">Claim</button>`;
    }
}

function updateStats(donations) {
    const availableCount = donations.filter(d => d.status === 'open').length;
    const claimedCount = donations.filter(d => d.status === 'claimed').length;
    
    // Update stats in sidebar
    const availableElement = document.querySelector('.col-6:first-child .fw-bold.text-success');
    const claimedElement = document.querySelector('.col-6:last-child .fw-bold.text-primary');
    
    if (availableElement) availableElement.textContent = availableCount;
    if (claimedElement) claimedElement.textContent = claimedCount;
}

function updateLastUpdated() {
    const lastUpdatedElement = document.querySelector('.last-updated');
    if (lastUpdatedElement) {
        const now = new Date();
        lastUpdatedElement.textContent = now.toLocaleTimeString();
    }
}

async function claimDonation(donationId) {
    try {
        const response = await fetch(`/api/donation/${donationId}/claim`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        
        const result = await response.json();
        
        if (result.success) {
            showAlert('Donation claimed successfully!', 'success');
            // Refresh the feed
            setTimeout(loadDonations, 1000);
        } else {
            showAlert(result.message || 'Failed to claim donation', 'danger');
        }
    } catch (error) {
        console.error('Error claiming donation:', error);
        showAlert('An error occurred while claiming the donation', 'danger');
    }
}

function showAlert(message, type) {
    // Remove existing alerts
    const existingAlerts = document.querySelectorAll('.alert');
    existingAlerts.forEach(alert => alert.remove());
    
    // Create new alert
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    // Insert at the top of the main content
    const container = document.querySelector('.container');
    if (container) {
        container.insertBefore(alertDiv, container.firstChild);
    }
}