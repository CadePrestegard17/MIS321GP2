// Global state for filtering
let currentFilter = 'all';

// Admin organizations page specific functionality
document.addEventListener('DOMContentLoaded', function() {
    console.log('Admin organizations page loaded');
    
    // Load organizations
    loadOrganizations();
    
    // Set up refresh button
    const refreshBtn = document.getElementById('refresh-orgs-btn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', handleRefresh);
    }
    
    // Set up filter options
    const filterOptions = document.querySelectorAll('.filter-option');
    filterOptions.forEach(option => {
        option.addEventListener('click', function(e) {
            e.preventDefault();
            const filter = this.getAttribute('data-filter');
            applyFilter(filter);
        });
    });
    
    // Set up add organization modal
    const addOrgBtn = document.getElementById('add-organization-btn');
    if (addOrgBtn) {
        addOrgBtn.addEventListener('click', showAddOrganizationModal);
    }
    
    // Set up edit button listeners
    document.addEventListener('click', function(e) {
        const editBtn = e.target.closest('.edit-org-btn');
        if (editBtn) {
            const orgId = editBtn.getAttribute('data-org-id');
            e.preventDefault();
            e.stopPropagation();
            openEditModal(orgId);
        }
        
        // Handle verify button clicks
        const verifyBtn = e.target.closest('.verify-btn');
        if (verifyBtn) {
            const orgId = verifyBtn.getAttribute('data-org-id');
            e.preventDefault();
            e.stopPropagation();
            handleVerifyOrganization(orgId, verifyBtn);
        }
    });
    
    function handleVerifyOrganization(orgId, verifyBtn) {
        // Find the organization row
        const row = document.querySelector(`tr[data-org-id="${orgId}"]`);
        if (!row) {
            showToast('Organization not found', 'danger');
            return;
        }
        
        // Get current status
        const statusBadge = row.querySelector('.status-badge');
        const currentStatus = statusBadge.classList.contains('status-verified') ? 'verified' : 'pending';
        
        // Toggle status
        const newStatus = currentStatus === 'verified' ? 'pending' : 'verified';
        
        // Update status badge
        statusBadge.className = `badge status-badge status-${newStatus}`;
        statusBadge.textContent = newStatus.charAt(0).toUpperCase() + newStatus.slice(1);
        
        // Update button to show current status
        verifyBtn.textContent = newStatus.charAt(0).toUpperCase() + newStatus.slice(1);
        if (newStatus === 'verified') {
            verifyBtn.className = 'btn btn-success btn-sm verify-btn';
        } else {
            verifyBtn.className = 'btn btn-warning btn-sm verify-btn';
        }
        
        showToast(`Organization marked as ${newStatus}`, 'success');
    }
});

function handleRefresh() {
    console.log('Refreshing organizations...');
    showToast('Refreshing organizations...', 'info');
    
    // Simulate a refresh delay
    setTimeout(() => {
        location.reload();
    }, 500);
}

function applyFilter(filter) {
    console.log('Applying filter:', filter);
    currentFilter = filter;
    
    // Update filter button text
    const filterBtn = document.getElementById('filter-orgs-btn');
    const filterOptions = document.querySelectorAll('.filter-option');
    filterOptions.forEach(option => {
        const optionFilter = option.getAttribute('data-filter');
        if (optionFilter === filter) {
            filterBtn.innerHTML = `<i class="bi bi-funnel me-1"></i>Filter: ${option.textContent}`;
        }
    });
    
    // Filter the table rows
    const tableRows = document.querySelectorAll('tbody tr');
    let visibleCount = 0;
    
    tableRows.forEach(row => {
        let shouldShow = true;
        
        if (filter === 'all') {
            shouldShow = true;
        } else if (filter === 'donor') {
            const typeBadge = row.querySelector('.badge.bg-primary');
            shouldShow = typeBadge !== null;
        } else if (filter === 'nonprofit') {
            const typeBadge = row.querySelector('.badge.bg-success');
            shouldShow = typeBadge !== null;
        } else if (filter === 'verified') {
            const statusBadge = row.querySelector('.status-badge');
            shouldShow = statusBadge && statusBadge.classList.contains('status-verified');
        } else if (filter === 'pending') {
            const statusBadge = row.querySelector('.status-badge');
            shouldShow = statusBadge && statusBadge.classList.contains('status-pending');
        } else if (filter === 'suspended') {
            const statusBadge = row.querySelector('.status-badge');
            shouldShow = statusBadge && statusBadge.classList.contains('status-suspended');
        }
        
        if (shouldShow) {
            row.style.display = '';
            visibleCount++;
        } else {
            row.style.display = 'none';
        }
    });
    
    showToast(`Showing ${visibleCount} organizations`, 'success');
}

function loadOrganizations() {
    console.log('Loading organizations...');
    
    // Mock data for now - replace with actual API calls
    const mockOrganizations = [
        {
            id: 1,
            name: 'Community Food Bank',
            type: 'Nonprofit',
            email: 'contact@communityfoodbank.org',
            phone: '(555) 123-4567',
            address: '123 Main St, City, State 12345',
            status: 'active',
            joinedDate: '2024-01-01',
            totalDonations: 45
        },
        {
            id: 2,
            name: 'Green Valley Farm',
            type: 'Donor',
            email: 'info@greenvalleyfarm.com',
            phone: '(555) 987-6543',
            address: '456 Farm Rd, Rural, State 67890',
            status: 'active',
            joinedDate: '2024-01-05',
            totalDonations: 23
        }
    ];
    
    displayOrganizations(mockOrganizations);
}

function displayOrganizations(organizations) {
    const orgsContainer = document.getElementById('organizations-container');
    if (!orgsContainer) return;
    
    orgsContainer.innerHTML = '';
    
    organizations.forEach(org => {
        const orgCard = createOrganizationCard(org);
        orgsContainer.appendChild(orgCard);
    });
}

function createOrganizationCard(org) {
    const statusClass = org.status === 'active' ? 'success' : 
                       org.status === 'suspended' ? 'warning' : 'danger';
    
    const card = document.createElement('div');
    card.className = 'card mb-3';
    card.innerHTML = `
        <div class="card-body">
            <div class="d-flex justify-content-between align-items-start">
                <div>
                    <h5 class="card-title">
                        ${org.name}
                        <span class="badge bg-${statusClass} ms-2">${org.status}</span>
                    </h5>
                    <p class="card-text">
                        <i class="bi bi-tag me-1"></i>${org.type}
                    </p>
                    <div class="row">
                        <div class="col-md-6">
                            <p class="mb-1">
                                <i class="bi bi-envelope me-1"></i>${org.email}
                            </p>
                            <p class="mb-1">
                                <i class="bi bi-telephone me-1"></i>${org.phone}
                            </p>
                        </div>
                        <div class="col-md-6">
                            <p class="mb-1">
                                <i class="bi bi-calendar me-1"></i>Joined: ${org.joinedDate}
                            </p>
                            <p class="mb-1">
                                <i class="bi bi-box me-1"></i>Donations: ${org.totalDonations}
                            </p>
                        </div>
                    </div>
                    <small class="text-muted">
                        <i class="bi bi-geo-alt me-1"></i>${org.address}
                    </small>
                </div>
                <div class="text-end">
                    <div class="btn-group" role="group">
                        <button class="btn btn-outline-primary btn-sm" onclick="editOrganization(${org.id})">
                            <i class="bi bi-pencil me-1"></i>Edit
                        </button>
                        <button class="btn btn-outline-${org.status === 'active' ? 'warning' : 'success'} btn-sm" onclick="toggleOrganizationStatus(${org.id})">
                            <i class="bi bi-${org.status === 'active' ? 'pause' : 'play'} me-1"></i>
                            ${org.status === 'active' ? 'Suspend' : 'Activate'}
                        </button>
                        <button class="btn btn-outline-danger btn-sm" onclick="deleteOrganization(${org.id})">
                            <i class="bi bi-trash me-1"></i>Delete
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    return card;
}

function showAddOrganizationModal() {
    // TODO: Implement modal functionality
    console.log('Showing add organization modal');
}

function editOrganization(orgId) {
    console.log('Editing organization:', orgId);
    // TODO: Implement edit functionality
}

function toggleOrganizationStatus(orgId) {
    console.log('Toggling organization status:', orgId);
    
    // TODO: Replace with actual API call
    // const response = await fetch(`/api/organizations/${orgId}/toggle-status`, {
    //     method: 'POST'
    // });
    
    showToast('Organization status updated successfully!', 'success');
    
    // Refresh organizations
    loadOrganizations();
}

function deleteOrganization(orgId) {
    if (confirm('Are you sure you want to delete this organization?')) {
        console.log('Deleting organization:', orgId);
        
        // TODO: Replace with actual API call
        // const response = await fetch(`/api/organizations/${orgId}`, {
        //     method: 'DELETE'
        // });
        
        showToast('Organization deleted successfully!', 'success');
        
        // Refresh organizations
        loadOrganizations();
    }
}

function openEditModal(orgId) {
    console.log('Opening edit modal for organization:', orgId);
    
    // Find the organization row
    const row = document.querySelector(`tr[data-org-id="${orgId}"]`);
    if (!row) {
        showToast('Organization not found', 'danger');
        return;
    }
    
    // Extract organization data from the table row
    const orgName = row.querySelector('.fw-bold').textContent;
    const orgBadge = row.querySelector('.badge.bg-primary, .badge.bg-success');
    const orgType = orgBadge ? orgBadge.textContent : 'Donor';
    const statusBadge = row.querySelector('.status-badge');
    const orgStatus = statusBadge ? statusBadge.textContent.toLowerCase() : 'verified';
    
    // Extract contact info
    const contactDiv = row.querySelector('td:nth-child(4)');
    const email = contactDiv.querySelector('div').textContent.trim();
    const phone = contactDiv.querySelector('small.text-muted').textContent.trim().replace(/[()]/g, '');
    
    // Populate the form
    document.getElementById('editOrgId').value = orgId;
    document.getElementById('editOrgName').value = orgName;
    document.getElementById('editOrgType').value = orgType;
    document.getElementById('editOrgEmail').value = email;
    document.getElementById('editOrgPhone').value = phone;
    document.getElementById('editOrgStatus').value = orgStatus;
    
    // Show the modal
    const modal = new bootstrap.Modal(document.getElementById('editOrgModal'));
    modal.show();
}

function saveOrganization() {
    const orgId = document.getElementById('editOrgId').value;
    const orgName = document.getElementById('editOrgName').value;
    const orgType = document.getElementById('editOrgType').value;
    const orgEmail = document.getElementById('editOrgEmail').value;
    const orgPhone = document.getElementById('editOrgPhone').value;
    const orgStatus = document.getElementById('editOrgStatus').value;
    
    console.log('Saving organization:', {
        orgId, orgName, orgType, orgEmail, orgPhone, orgStatus
    });
    
    // Find the organization row
    const row = document.querySelector(`tr[data-org-id="${orgId}"]`);
    if (!row) {
        showToast('Organization not found', 'danger');
        return;
    }
    
    // Update the table row with new data
    row.querySelector('.fw-bold').textContent = orgName;
    
    // Update type badge
    const typeBadge = row.querySelector('.badge.bg-primary, .badge.bg-success');
    if (typeBadge) {
        typeBadge.className = orgType === 'Donor' ? 'badge bg-primary' : 'badge bg-success';
        typeBadge.textContent = orgType;
    }
    
    // Update status badge
    const statusBadge = row.querySelector('.status-badge');
    if (statusBadge) {
        statusBadge.className = `badge status-badge status-${orgStatus}`;
        statusBadge.textContent = orgStatus.charAt(0).toUpperCase() + orgStatus.slice(1);
    }
    
    // Update contact info
    const contactDiv = row.querySelector('td:nth-child(4)');
    contactDiv.querySelector('div').textContent = orgEmail;
    const phoneText = contactDiv.querySelector('small.text-muted');
    if (phoneText) {
        // Format phone number
        const formattedPhone = orgPhone.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
        phoneText.textContent = formattedPhone;
    }
    
    // Update verify button to show current status
    const verifyBtn = row.querySelector('.verify-btn');
    if (verifyBtn) {
        verifyBtn.textContent = orgStatus.charAt(0).toUpperCase() + orgStatus.slice(1);
        if (orgStatus === 'verified') {
            verifyBtn.className = 'btn btn-success btn-sm verify-btn';
        } else if (orgStatus === 'pending') {
            verifyBtn.className = 'btn btn-warning btn-sm verify-btn';
        } else {
            verifyBtn.className = 'btn btn-danger btn-sm verify-btn';
        }
    }
    
    // Hide the modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('editOrgModal'));
    modal.hide();
    
    // Show success message
    showToast('Organization updated successfully!', 'success');
}

// Make functions globally available
window.openEditModal = openEditModal;
window.saveOrganization = saveOrganization;