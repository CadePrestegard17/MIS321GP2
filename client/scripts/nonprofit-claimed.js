// Nonprofit Claimed Donations Page JavaScript
console.log('Nonprofit claimed donations page loaded');

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    initializeClaimedDonations();
});

function initializeClaimedDonations() {
    loadClaimedDonations();
    
    // Set up refresh button
    const refreshBtn = document.querySelector('.btn-outline-primary');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', loadClaimedDonations);
    }
    
    // Auto-refresh every 30 seconds
    setInterval(loadClaimedDonations, 30000);
}

async function loadClaimedDonations() {
    try {
        const response = await fetch('/api/donation/claimed');
        const result = await response.json();
        
        if (result.donations) {
            displayClaimedDonations(result.donations);
            updateClaimStats(result.donations);
            updateLastUpdated();
        } else {
            console.error('Failed to load claimed donations:', result);
            showAlert('Failed to load claimed donations', 'danger');
        }
    } catch (error) {
        console.error('Error loading claimed donations:', error);
        showAlert('An error occurred while loading claimed donations', 'danger');
    }
}

function displayClaimedDonations(donations) {
    const container = document.querySelector('.claimed-donations');
    if (!container) return;
    
    // Clear existing donations
    container.innerHTML = '';
    
    if (donations.length === 0) {
        container.innerHTML = `
            <div class="card">
                <div class="card-body text-center py-5">
                    <i class="bi bi-inbox fs-1 text-muted mb-3"></i>
                    <h5 class="text-muted">No claimed donations</h5>
                    <p class="text-muted">You haven't claimed any donations yet!</p>
                    <a href="nonprofit-feed.html" class="btn btn-primary">
                        <i class="bi bi-list-ul me-1"></i>Browse Available Donations
                    </a>
                </div>
            </div>
        `;
        return;
    }
    
    donations.forEach(donation => {
        const donationCard = createClaimedDonationCard(donation);
        container.appendChild(donationCard);
    });
}

function createClaimedDonationCard(donation) {
    const card = document.createElement('div');
    card.className = 'card claimed-donation-card mb-3';
    card.setAttribute('data-donation-id', donation.id);
    
    const statusClass = getClaimStatusClass(donation.status);
    const statusText = getClaimStatusText(donation.status);
    const timeInfo = getTimeInfo(donation);
    const donorName = getDonorDisplayName(donation.donor);
    
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
                            📍 <strong>Pickup Location:</strong> ${formatAddress(donation.address)}<br>
                            ⏰ ${timeInfo}
                        </small>
                    </p>
                    ${donation.notes ? `<p class="card-text"><small class="text-muted">${donation.notes}</small></p>` : ''}
                </div>
                <div class="col-md-4 text-end">
                    ${getClaimActionButton(donation)}
                </div>
            </div>
        </div>
    `;
    
    return card;
}

function getClaimStatusClass(status) {
    switch (status) {
        case 'claimed': return 'status-claimed';
        case 'picked_up': return 'status-picked-up';
        case 'delivered': return 'status-delivered';
        default: return 'status-claimed';
    }
}

function getClaimStatusText(status) {
    switch (status) {
        case 'claimed': return 'Pending Pickup';
        case 'picked_up': return 'In Transit';
        case 'delivered': return 'Delivered';
        default: return 'Pending Pickup';
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

function getDonorDisplayName(donor) {
    if (!donor) return 'Anonymous Donor';
    
    // Prioritize business/organization name over personal name
    if (donor.businessName) {
        return donor.businessName;
    }
    if (donor.organizationName) {
        return donor.organizationName;
    }
    
    // Fall back to personal name
    if (donor.firstName && donor.lastName) {
        return `${donor.firstName} ${donor.lastName}`;
    }
    
    return 'Anonymous Donor';
}

function getClaimActionButton(donation) {
    switch (donation.status) {
        case 'claimed':
            return `<small class="text-muted">Waiting for pickup confirmation</small>`;
        case 'picked_up':
            return `<small class="text-muted">In transit${donation.AssignedDriver ? ' with ' + donation.AssignedDriver.FirstName : ''}</small>`;
        case 'delivered':
            return `<small class="text-success"><i class="bi bi-check-circle me-1"></i>Delivered</small>`;
        default:
            return `<small class="text-muted">Processing...</small>`;
    }
}

function updateClaimStats(donations) {
    const pendingCount = donations.filter(d => d.status === 'claimed').length;
    const readyCount = donations.filter(d => d.status === 'picked_up').length;
    
    // Update stats in sidebar
    const pendingElement = document.querySelector('.col-6:first-child .fw-bold.text-warning');
    const readyElement = document.querySelector('.col-6:last-child .fw-bold.text-success');
    
    if (pendingElement) pendingElement.textContent = pendingCount;
    if (readyElement) readyElement.textContent = readyCount;
}

function updateLastUpdated() {
    const lastUpdatedElement = document.querySelector('.last-updated');
    if (lastUpdatedElement) {
        const now = new Date();
        lastUpdatedElement.textContent = now.toLocaleTimeString();
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
