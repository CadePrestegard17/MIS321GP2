// Main JavaScript for Food Surplus Donation Platform

// Global state management
window.appState = {
  currentUser: null,
  donations: [],
  organizations: [],
  routes: []
};

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
  initializeApp();
});

function initializeApp() {
  // Load seed data
  loadSeedData();
  
  // Initialize role-based navigation
  initializeNavigation();
  
  // Set up event listeners
  setupEventListeners();
}

function loadSeedData() {
  // Seed donations data
  window.appState.donations = [
    {
      id: 'DON-001',
      itemName: 'Fresh Organic Vegetables',
      category: 'Produce',
      quantity: '25 lbs',
      safeUntil: '2024-01-15T18:00:00',
      pickupWindow: '2024-01-15T14:00:00 - 2024-01-15T16:00:00',
      address: '123 Main St, Downtown',
      notes: 'Mixed seasonal vegetables, all fresh',
      status: 'open',
      donorId: 'DONOR-001',
      donorName: 'Green Grocery Co.',
      claimedBy: null,
      claimedAt: null,
      pickedUpAt: null,
      deliveredAt: null,
      createdAt: new Date().toISOString(),
      distance: '2.1 mi'
    },
    {
      id: 'DON-002',
      itemName: 'Artisan Bread & Pastries',
      category: 'Bakery',
      quantity: '15 items',
      safeUntil: '2024-01-15T20:00:00',
      pickupWindow: '2024-01-15T16:00:00 - 2024-01-15T18:00:00',
      address: '456 Oak Ave, Midtown',
      notes: 'Day-old but still fresh, perfect for toast',
      status: 'claimed',
      donorId: 'DONOR-002',
      donorName: 'Bakery Bliss',
      claimedBy: 'NPO-001',
      claimedAt: '2024-01-15T10:30:00',
      pickedUpAt: null,
      deliveredAt: null,
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      distance: '1.8 mi',
      eta: '5:15 PM'
    },
    {
      id: 'DON-003',
      itemName: 'Prepared Meals',
      category: 'Prepared',
      quantity: '40 servings',
      safeUntil: '2024-01-15T22:00:00',
      pickupWindow: '2024-01-15T18:00:00 - 2024-01-15T20:00:00',
      address: '789 Pine St, Uptown',
      notes: 'Catering leftovers, various cuisines',
      status: 'picked-up',
      donorId: 'DONOR-003',
      donorName: 'Catering Plus',
      claimedBy: 'NPO-002',
      claimedAt: '2024-01-15T09:15:00',
      pickedUpAt: '2024-01-15T14:30:00',
      deliveredAt: null,
      createdAt: new Date(Date.now() - 7200000).toISOString(),
      distance: '3.2 mi'
    }
  ];

  // Seed organizations data
  window.appState.organizations = [
    {
      id: 'DONOR-001',
      name: 'Green Grocery Co.',
      type: 'donor',
      status: 'verified',
      email: 'contact@greengrocery.com',
      phone: '(555) 123-4567'
    },
    {
      id: 'DONOR-002',
      name: 'Bakery Bliss',
      type: 'donor',
      status: 'verified',
      email: 'info@bakerybliss.com',
      phone: '(555) 234-5678'
    },
    {
      id: 'NPO-001',
      name: 'Community Food Bank',
      type: 'nonprofit',
      status: 'verified',
      email: 'volunteer@communityfoodbank.org',
      phone: '(555) 345-6789'
    },
    {
      id: 'NPO-002',
      name: 'Hope Kitchen',
      type: 'nonprofit',
      status: 'verified',
      email: 'info@hopekitchen.org',
      phone: '(555) 456-7890'
    },
    {
      id: 'NPO-003',
      name: 'New Hope Shelter',
      type: 'nonprofit',
      status: 'pending',
      email: 'contact@newhopeshelter.org',
      phone: '(555) 567-8901'
    }
  ];

  // Seed routes data
  window.appState.routes = [
    {
      id: 'ROUTE-001',
      donationId: 'DON-001',
      driverId: 'DRIVER-001',
      status: 'assigned',
      pickupAddress: '123 Main St, Downtown',
      dropoffAddress: 'Community Food Bank, 100 Help St',
      estimatedDuration: '25 min',
      distance: '8.5 mi',
      stops: [
        { type: 'pickup', address: '123 Main St, Downtown', completed: false },
        { type: 'dropoff', address: 'Community Food Bank, 100 Help St', completed: false }
      ]
    }
  ];
}

function initializeNavigation() {
  const currentUser = getCurrentUser();
  if (currentUser) {
    updateNavigationForRole(currentUser.role);
  }
}

function getCurrentUser() {
  const userData = localStorage.getItem('currentUser');
  return userData ? JSON.parse(userData) : null;
}

function setCurrentUser(user) {
  localStorage.setItem('currentUser', JSON.stringify(user));
  window.appState.currentUser = user;
}

function updateNavigationForRole(role) {
  const navLinks = document.querySelectorAll('.nav-link[data-role]');
  navLinks.forEach(link => {
    const requiredRoles = link.dataset.role.split(',');
    if (requiredRoles.includes(role) || requiredRoles.includes('all')) {
      link.style.display = 'block';
    } else {
      link.style.display = 'none';
    }
  });

  // Update role badge
  const roleBadge = document.querySelector('.role-badge');
  if (roleBadge) {
    roleBadge.textContent = role.toUpperCase();
  }
}

function setupEventListeners() {
  // Form submissions
  document.addEventListener('submit', handleFormSubmission);
  
  // Button clicks
  document.addEventListener('click', handleButtonClick);
  
  // Real-time updates simulation
  if (window.location.pathname.includes('nonprofit-feed')) {
    simulateRealTimeUpdates();
  }
}

function handleFormSubmission(event) {
  const form = event.target;
  
  if (form.id === 'donation-form') {
    event.preventDefault();
    handleDonationSubmission(form);
  } else if (form.id === 'login-form') {
    event.preventDefault();
    handleLogin(form);
  }
}

function handleButtonClick(event) {
  const button = event.target;
  
  if (button.classList.contains('claim-btn')) {
    event.preventDefault();
    handleClaimDonation(button.dataset.donationId);
  } else if (button.classList.contains('verify-btn')) {
    event.preventDefault();
    handleVerifyOrganization(button.dataset.orgId);
  } else if (button.classList.contains('start-route-btn')) {
    event.preventDefault();
    handleStartRoute(button.dataset.routeId);
  } else if (button.classList.contains('mark-picked-up-btn')) {
    event.preventDefault();
    handleMarkPickedUp(button.dataset.donationId);
  } else if (button.classList.contains('mark-delivered-btn')) {
    event.preventDefault();
    handleMarkDelivered(button.dataset.donationId);
  }
}

function handleDonationSubmission(form) {
  const formData = new FormData(form);
  const donation = {
    id: 'DON-' + Date.now(),
    itemName: formData.get('itemName'),
    category: formData.get('category'),
    quantity: formData.get('quantity'),
    safeUntil: formData.get('safeUntil'),
    pickupWindow: formData.get('pickupWindow'),
    address: formData.get('address'),
    notes: formData.get('notes'),
    status: 'open',
    donorId: 'DONOR-001',
    donorName: 'Current User',
    claimedBy: null,
    claimedAt: null,
    pickedUpAt: null,
    deliveredAt: null,
    createdAt: new Date().toISOString(),
    distance: '0.5 mi'
  };

  // Add to donations
  window.appState.donations.unshift(donation);
  
  // Show success state
  showDonationSuccess(donation);
  
  // Show success toast
  showToast('Donation posted successfully!', 'success');
}

function showDonationSuccess(donation) {
  const formContainer = document.querySelector('.donation-form-container');
  if (formContainer) {
    formContainer.innerHTML = `
      <div class="card border-success">
        <div class="card-header bg-success text-white">
          <h5 class="mb-0">✅ Donation Posted Successfully!</h5>
        </div>
        <div class="card-body">
          <div class="row">
            <div class="col-md-6">
              <h6>Donation Details</h6>
              <p><strong>ID:</strong> ${donation.id}</p>
              <p><strong>Item:</strong> ${donation.itemName}</p>
              <p><strong>Quantity:</strong> ${donation.quantity}</p>
              <p><strong>Category:</strong> ${donation.category}</p>
            </div>
            <div class="col-md-6">
              <h6>Status</h6>
              <span class="badge bg-success status-badge">Open</span>
              <p class="mt-2"><strong>Posted:</strong> ${new Date(donation.createdAt).toLocaleString()}</p>
              <p><strong>Safe Until:</strong> ${new Date(donation.safeUntil).toLocaleString()}</p>
            </div>
          </div>
          <div class="mt-3">
            <a href="nonprofit-feed.html" class="btn btn-primary">View in Feed</a>
            <a href="donor-new-donation.html" class="btn btn-outline-secondary">Post Another</a>
          </div>
        </div>
      </div>
    `;
  }
}

function handleClaimDonation(donationId) {
  const donation = window.appState.donations.find(d => d.id === donationId);
  if (donation && donation.status === 'open') {
    donation.status = 'claimed';
    donation.claimedBy = 'NPO-001';
    donation.claimedAt = new Date().toISOString();
    donation.eta = '5:15 PM'; // Simulated ETA
    
    // Update UI
    updateDonationStatus(donationId, 'claimed');
    showToast('Donation claimed successfully!', 'success');
    
    // Show ETA input modal
    showETAModal(donationId);
  }
}

function showETAModal(donationId) {
  const modal = document.createElement('div');
  modal.className = 'modal fade';
  modal.innerHTML = `
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Set Pickup ETA</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body">
          <div class="mb-3">
            <label for="eta-input" class="form-label">Estimated Arrival Time</label>
            <input type="time" class="form-control" id="eta-input" value="17:15">
          </div>
          <div class="mb-3">
            <label for="contact-method" class="form-label">Contact Donor</label>
            <div class="btn-group w-100" role="group">
              <a href="tel:+15551234567" class="btn btn-outline-primary">📞 Call</a>
              <a href="mailto:contact@greengrocery.com" class="btn btn-outline-primary">✉️ Email</a>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
          <button type="button" class="btn btn-primary" onclick="confirmETA('${donationId}')">Confirm ETA</button>
        </div>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  const bsModal = new bootstrap.Modal(modal);
  bsModal.show();
  
  modal.addEventListener('hidden.bs.modal', () => {
    document.body.removeChild(modal);
  });
}

function confirmETA(donationId) {
  const etaInput = document.getElementById('eta-input');
  const donation = window.appState.donations.find(d => d.id === donationId);
  if (donation) {
    donation.eta = etaInput.value;
    updateDonationStatus(donationId, 'claimed');
    showToast('ETA confirmed!', 'success');
  }
  
  // Close modal
  const modal = document.querySelector('.modal');
  if (modal) {
    const bsModal = bootstrap.Modal.getInstance(modal);
    bsModal.hide();
  }
}

function handleVerifyOrganization(orgId) {
  const org = window.appState.organizations.find(o => o.id === orgId);
  if (org) {
    org.status = org.status === 'verified' ? 'pending' : 'verified';
    updateOrganizationStatus(orgId, org.status);
    showToast(`Organization ${org.status}`, 'success');
  }
}

function handleStartRoute(routeId) {
  const route = window.appState.routes.find(r => r.id === routeId);
  if (route) {
    route.status = 'in-progress';
    updateRouteStatus(routeId, 'in-progress');
    showToast('Route started!', 'success');
  }
}

function handleMarkPickedUp(donationId) {
  const donation = window.appState.donations.find(d => d.id === donationId);
  if (donation) {
    donation.status = 'picked-up';
    donation.pickedUpAt = new Date().toISOString();
    updateDonationStatus(donationId, 'picked-up');
    showToast('Marked as picked up!', 'success');
  }
}

function handleMarkDelivered(donationId) {
  const donation = window.appState.donations.find(d => d.id === donationId);
  if (donation) {
    donation.status = 'delivered';
    donation.deliveredAt = new Date().toISOString();
    updateDonationStatus(donationId, 'delivered');
    showToast('Marked as delivered!', 'success');
  }
}

function updateDonationStatus(donationId, status) {
  const statusElements = document.querySelectorAll(`[data-donation-id="${donationId}"] .status-badge`);
  statusElements.forEach(element => {
    element.className = `badge status-badge status-${status}`;
    element.textContent = getStatusText(status);
  });
  
  // Update progress timeline if present
  updateProgressTimeline(donationId, status);
}

function updateOrganizationStatus(orgId, status) {
  const statusElements = document.querySelectorAll(`[data-org-id="${orgId}"] .status-badge`);
  statusElements.forEach(element => {
    element.className = `badge status-badge status-${status}`;
    element.textContent = status.charAt(0).toUpperCase() + status.slice(1);
  });
  
  const verifyButtons = document.querySelectorAll(`[data-org-id="${orgId}"] .verify-btn`);
  verifyButtons.forEach(button => {
    button.textContent = status === 'verified' ? 'Unverify' : 'Verify';
    button.className = status === 'verified' ? 'btn btn-warning btn-sm verify-btn' : 'btn btn-success btn-sm verify-btn';
  });
}

function updateRouteStatus(routeId, status) {
  const statusElements = document.querySelectorAll(`[data-route-id="${routeId}"] .status-badge`);
  statusElements.forEach(element => {
    element.className = `badge status-badge status-${status}`;
    element.textContent = getStatusText(status);
  });
}

function getStatusText(status) {
  const statusMap = {
    'open': 'Open',
    'claimed': 'Claimed',
    'picked-up': 'Picked Up',
    'delivered': 'Delivered',
    'expired': 'Expired',
    'assigned': 'Assigned',
    'in-progress': 'In Progress',
    'completed': 'Completed'
  };
  return statusMap[status] || status;
}

function updateProgressTimeline(donationId, status) {
  const timelineItems = document.querySelectorAll(`[data-donation-id="${donationId}"] .timeline-item`);
  const statusOrder = ['open', 'claimed', 'picked-up', 'delivered'];
  const currentIndex = statusOrder.indexOf(status);
  
  timelineItems.forEach((item, index) => {
    item.classList.remove('completed', 'active');
    if (index < currentIndex) {
      item.classList.add('completed');
    } else if (index === currentIndex) {
      item.classList.add('active');
    }
  });
}

function simulateRealTimeUpdates() {
  // Simulate new donation appearing
  setTimeout(() => {
    const newDonation = {
      id: 'DON-NEW',
      itemName: 'Fresh Salad Mix',
      category: 'Produce',
      quantity: '12 lbs',
      safeUntil: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
      pickupWindow: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString() + ' - ' + new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
      address: '321 Elm St, Downtown',
      notes: 'Mixed greens, perfect for salads',
      status: 'open',
      donorId: 'DONOR-004',
      donorName: 'Fresh Market',
      claimedBy: null,
      claimedAt: null,
      pickedUpAt: null,
      deliveredAt: null,
      createdAt: new Date().toISOString(),
      distance: '1.2 mi'
    };
    
    window.appState.donations.unshift(newDonation);
    addDonationToFeed(newDonation);
    showToast('New donation available nearby!', 'info');
  }, 5000);
}

function addDonationToFeed(donation) {
  const feedContainer = document.querySelector('.donations-feed');
  if (feedContainer) {
    const donationCard = createDonationCard(donation);
    feedContainer.insertBefore(donationCard, feedContainer.firstChild);
    
    // Add animation
    donationCard.style.opacity = '0';
    donationCard.style.transform = 'translateY(-20px)';
    setTimeout(() => {
      donationCard.style.transition = 'all 0.5s ease';
      donationCard.style.opacity = '1';
      donationCard.style.transform = 'translateY(0)';
    }, 100);
  }
}

function createDonationCard(donation) {
  const card = document.createElement('div');
  card.className = 'card donation-card mb-3';
  card.innerHTML = `
    <div class="card-body">
      <div class="d-flex justify-content-between align-items-start mb-2">
        <h6 class="card-title mb-0">${donation.itemName}</h6>
        <span class="badge status-badge status-${donation.status}">${getStatusText(donation.status)}</span>
      </div>
      <div class="row">
        <div class="col-md-8">
          <p class="card-text">
            <strong>${donation.category}</strong> • ${donation.quantity}<br>
            <small class="text-muted">${donation.donorName} • ${donation.distance}</small>
          </p>
          <p class="card-text">
            <small class="text-muted">
              📍 ${donation.address}<br>
              ⏰ Safe for ${getTimeRemaining(donation.safeUntil)}
            </small>
          </p>
        </div>
        <div class="col-md-4 text-end">
          ${donation.status === 'open' ? 
            `<button class="btn btn-primary btn-sm claim-btn" data-donation-id="${donation.id}">Claim</button>` :
            `<small class="text-muted">Claimed by Community Food Bank</small>`
          }
        </div>
      </div>
    </div>
  `;
  return card;
}

function getTimeRemaining(safeUntil) {
  const now = new Date();
  const safeUntilDate = new Date(safeUntil);
  const diffMs = safeUntilDate - now;
  
  if (diffMs <= 0) return 'Expired';
  
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else {
    return `${minutes}m`;
  }
}

function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast align-items-center text-white bg-${type} border-0`;
  toast.setAttribute('role', 'alert');
  toast.innerHTML = `
    <div class="d-flex">
      <div class="toast-body">${message}</div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
    </div>
  `;
  
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  
  container.appendChild(toast);
  
  const bsToast = new bootstrap.Toast(toast);
  bsToast.show();
  
  toast.addEventListener('hidden.bs.toast', () => {
    container.removeChild(toast);
  });
}

function handleLogin(form) {
  const formData = new FormData(form);
  const role = formData.get('role');
  const user = {
    id: 'USER-001',
    name: 'Demo User',
    role: role,
    email: 'demo@example.com'
  };
  
  setCurrentUser(user);
  updateNavigationForRole(role);
  
  // Redirect based on role
  const redirectMap = {
    'donor': 'donor-new-donation.html',
    'nonprofit': 'nonprofit-feed.html',
    'driver': 'driver-routes.html',
    'admin': 'admin-orgs.html'
  };
  
  window.location.href = redirectMap[role] || 'index.html';
}

// Export functions for global access
window.confirmETA = confirmETA;
window.showToast = showToast;
