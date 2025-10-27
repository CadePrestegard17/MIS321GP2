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
  console.log('initializeApp called');
  
  // Clear any old demo data
  const savedUser = localStorage.getItem('currentUser');
  if (savedUser) {
    try {
      const user = JSON.parse(savedUser);
      // Check if this is old demo data
      if (user.id === 'USER-001' || user.role === null || !user.role) {
        console.log('Clearing old demo user data');
        localStorage.removeItem('currentUser');
        window.appState.currentUser = null;
      } else {
        window.appState.currentUser = user;
        console.log('Parsed user:', window.appState.currentUser);
        updateNavigationForRole(window.appState.currentUser.role);
      }
    } catch (error) {
      console.error('Error parsing saved user:', error);
      localStorage.removeItem('currentUser');
    }
  }
  
  console.log('Current user state:', window.appState.currentUser);
  
  // Check page access permissions
  checkPageAccess();
  
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
  
  // Track if we've already updated navigation for admin to prevent re-running
  const isAdmin = role === 4;
  if (isAdmin) {
    // For admin, only update navigation label once, then keep it consistent
    let hasUpdated = false;
    navLinks.forEach(link => {
      if (link.dataset.adminLabel && !hasUpdated) {
        hasUpdated = true;
        // This will be handled below
      }
    });
  }
  
  navLinks.forEach(link => {
    const requiredRoles = link.dataset.role.split(',');
    const isAllowed = role && requiredRoles.includes(role.toString());
    
    if (isAllowed || isAdmin) {
      link.style.display = 'block';
      
      // Update label and icon ONLY for the nonprofit feed link AND only if not already updated
      if (link.href && link.href.includes('nonprofit-feed.html')) {
        // Check if this link has already been updated to prevent re-running
        if (link.dataset.adminUpdated) {
          // Already updated, skip
          return;
        }
        
        if (isAdmin && link.dataset.adminLabel) {
          // For admin, show "Donations" with gift icon
          const icon = link.dataset.adminIcon || 'bi-gift';
          link.innerHTML = `<i class="bi ${icon} me-1"></i>${link.dataset.adminLabel}`;
          link.dataset.adminUpdated = 'true'; // Mark as updated
        } else if (role === 2) {
          // For nonprofits, show "Dashboard" with chart icon
          link.innerHTML = `<i class="bi bi-graph-up me-1"></i>Dashboard`;
          link.dataset.adminUpdated = 'true';
        } else if (role === 1 || role === 3) {
          // For other roles, show "Dashboard" with chart icon
          link.innerHTML = `<i class="bi bi-graph-up me-1"></i>Dashboard`;
          link.dataset.adminUpdated = 'true';
        }
      }
    } else {
      link.style.display = 'none';
    }
  });
  
  // Update role badge
  const roleBadge = document.querySelector('.role-badge');
  if (roleBadge) {
    if (role) {
      const roleNames = { 1: 'DONOR', 2: 'NONPROFIT', 3: 'DRIVER', 4: 'ADMIN' };
      roleBadge.textContent = roleNames[role] || 'USER';
    } else {
      roleBadge.textContent = 'GUEST';
    }
    
    // Ensure the parent has the correct structure
    const parent = roleBadge.parentElement;
    if (parent) {
      // Remove any conflicting classes
      parent.classList.remove('navbar-text');
      // Add the correct classes
      parent.classList.add('nav-link', 'd-flex', 'align-items-center', 'me-3');
    }
  }
  
  // Update login/logout link
  const loginLink = document.querySelector('.nav-link[href="login.html"]');
  if (loginLink) {
    if (role) {
      loginLink.innerHTML = '<i class="bi bi-box-arrow-right me-1"></i>Logout';
      loginLink.href = '#';
      loginLink.onclick = function(e) {
        e.preventDefault();
        logout();
      };
    } else {
      loginLink.innerHTML = '<i class="bi bi-box-arrow-in-right me-1"></i>Login';
      loginLink.href = 'login.html';
      loginLink.onclick = null;
    }
  }
}

function setupEventListeners() {
  // Form submissions
  document.addEventListener('submit', handleFormSubmission);
  
  // Button clicks
  document.addEventListener('click', handleButtonClick);
  
  // Handle login/register form toggles
  const showRegisterLink = document.getElementById('show-register');
  const showLoginLink = document.getElementById('show-login');
  const loginCard = document.getElementById('login-card');
  const registerCard = document.getElementById('register-card');
  
  if (showRegisterLink) {
    showRegisterLink.addEventListener('click', function(e) {
      e.preventDefault();
      loginCard.style.display = 'none';
      registerCard.style.display = 'block';
    });
  }
  
  if (showLoginLink) {
    showLoginLink.addEventListener('click', function(e) {
      e.preventDefault();
      registerCard.style.display = 'none';
      loginCard.style.display = 'block';
    });
  }
  
  // Handle role selection for registration
  const roleSelect = document.getElementById('reg-role');
  if (roleSelect) {
    roleSelect.addEventListener('change', function() {
      const selectedRole = this.value;
      const donorFields = document.getElementById('donor-fields');
      const nonprofitFields = document.getElementById('nonprofit-fields');
      
      // Hide all role-specific fields
      document.querySelectorAll('.role-specific-fields').forEach(field => {
        field.style.display = 'none';
      });
      
      // Show relevant fields based on role
      if (selectedRole === '1' && donorFields) {
        donorFields.style.display = 'block';
      } else if (selectedRole === '2' && nonprofitFields) {
        nonprofitFields.style.display = 'block';
      }
    });
  }
  
  // Real-time updates simulation - disabled since we now use real API data
  // if (window.location.pathname.includes('nonprofit-feed')) {
  //   simulateRealTimeUpdates();
  // }
}

function handleFormSubmission(event) {
  const form = event.target;
  
  if (form.id === 'donation-form') {
    event.preventDefault();
    handleDonationSubmission(form);
  } else if (form.id === 'login-form') {
    event.preventDefault();
    handleLogin(form);
  } else if (form.id === 'register-form') {
    event.preventDefault();
    handleRegistration(form);
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

// Demo simulation functions removed - now using real API data only

// createDonationCard function moved to nonprofit-feed.js

// Authentication functions
async function handleLogin(form) {
  const formData = new FormData(form);
  const loginData = {
    email: formData.get('email'),
    password: formData.get('password')
  };
  
  console.log('Sending login request:', loginData);
  
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(loginData)
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);
    
    const result = await response.json();
    console.log('Response data:', result);
    
    if (result.success) {
      console.log('Login successful, user data:', result.user);
      console.log('User role:', result.user.role);
      
      // Store user data
      window.appState.currentUser = result.user;
      localStorage.setItem('currentUser', JSON.stringify(result.user));
      
      // Update navigation
      updateNavigationForRole(result.user.role);
      
      // Show success message first
      showToast('Login successful!', 'success');
      
      // Redirect after a short delay to ensure toast is shown
      setTimeout(() => {
        console.log('Redirecting to role:', result.user.role);
        redirectAfterLogin(result.user.role);
      }, 1000);
    } else {
      showToast(result.message || 'Login failed', 'danger');
    }
  } catch (error) {
    console.error('Login error:', error);
    showToast('An error occurred during login', 'danger');
  }
}

async function handleRegistration(form) {
  const formData = new FormData(form);
  const role = parseInt(formData.get('role'));
  
  // Get address fields based on role
  let address, city, state, zipCode, country;
  
  if (role === 1) { // Donor
    address = formData.get('address');
    city = formData.get('city');
    state = formData.get('state');
    zipCode = formData.get('zipCode');
    country = formData.get('country');
  } else if (role === 2) { // Nonprofit
    address = formData.get('orgAddress');
    city = formData.get('orgCity');
    state = formData.get('orgState');
    zipCode = formData.get('orgZipCode');
    country = formData.get('orgCountry');
  }
  
  const registerData = {
    email: formData.get('email'),
    password: formData.get('password'),
    firstName: formData.get('firstName'),
    lastName: formData.get('lastName'),
    role: role,
    businessName: formData.get('businessName'),
    businessType: formData.get('businessType'),
    organizationName: formData.get('organizationName'),
    organizationType: formData.get('organizationType'),
    address: address,
    city: city,
    state: state,
    zipCode: zipCode,
    country: country
  };
  
  try {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(registerData)
    });
    
    const result = await response.json();
    
    if (result.success) {
      // Store user data and redirect immediately
      window.appState.currentUser = result.user;
      localStorage.setItem('currentUser', JSON.stringify(result.user));
      
      // Update navigation
      updateNavigationForRole(result.user.role);
      
      // Show success message first
      showToast('Registration successful!', 'success');
      
      // Redirect after a short delay to ensure toast is shown
      setTimeout(() => {
        redirectAfterLogin(result.user.role);
      }, 1000);
    } else {
      showToast(result.message || 'Registration failed', 'danger');
    }
  } catch (error) {
    console.error('Registration error:', error);
    showToast('An error occurred during registration', 'danger');
  }
}

function redirectAfterLogin(role) {
  console.log('redirectAfterLogin called with role:', role);
  const roleMap = {
    1: 'donor-new-donation.html', // Donor
    2: 'nonprofit-feed.html',    // Nonprofit
    3: 'driver-routes.html',      // Driver
    4: 'dashboard.html'           // Admin
  };
  
  const redirectUrl = roleMap[role] || 'index.html';
  console.log('Redirecting to:', redirectUrl);
  window.location.href = redirectUrl;
}

function clearStorage() {
  localStorage.removeItem('currentUser');
  window.appState.currentUser = null;
  updateNavigationForRole(null);
  console.log('Storage cleared');
  alert('Storage cleared! Please refresh the page.');
}

function logout() {
  window.appState.currentUser = null;
  localStorage.removeItem('currentUser');
  updateNavigationForRole(null);
  window.location.href = 'index.html';
}

function checkPageAccess() {
  const currentPage = window.location.pathname.split('/').pop();
  const user = window.appState.currentUser;
  
  console.log('checkPageAccess - currentPage:', currentPage);
  console.log('checkPageAccess - user:', user);
  
  // Define page access rules
  const pageAccess = {
    'donor-new-donation.html': [1], // Donor only
    'nonprofit-feed.html': [2],     // Nonprofit only
    'nonprofit-claimed.html': [2],  // Nonprofit only
    'driver-routes.html': [3],       // Driver only
    'admin-orgs.html': [4],          // Admin only
    'dashboard.html': [4]            // Admin only
  };
  
  // If user is on a restricted page
  if (pageAccess[currentPage]) {
    const allowedRoles = pageAccess[currentPage];
    console.log('checkPageAccess - allowedRoles:', allowedRoles);
    
    // If not logged in, redirect to login
    if (!user) {
      console.log('checkPageAccess - no user, redirecting to login');
      window.location.href = 'login.html';
      return;
    }
    
    // If user role not allowed, redirect to their role page (unless admin)
    if (!allowedRoles.includes(user.role)) {
      // Admins can access all pages
      if (user.role === 4) {
        console.log('checkPageAccess - admin accessing all pages, allowing access');
        return;
      }
      
      console.log('checkPageAccess - user role not allowed, redirecting to role page');
      const rolePages = {
        1: 'donor-new-donation.html', // Donor
        2: 'nonprofit-feed.html',     // Nonprofit
        3: 'driver-routes.html',      // Driver
        4: 'dashboard.html'           // Admin
      };
      
      const redirectPage = rolePages[user.role] || 'index.html';
      window.location.href = redirectPage;
      return;
    }
  }
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


// Export functions for global access
window.confirmETA = confirmETA;
window.showToast = showToast;
