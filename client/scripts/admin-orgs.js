// Admin organizations page specific functionality
document.addEventListener('DOMContentLoaded', function() {
    console.log('Admin organizations page loaded');
    
    // Load organizations
    loadOrganizations();
    
    // Set up refresh functionality
    const refreshBtn = document.getElementById('refresh-orgs');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', loadOrganizations);
    }
    
    // Set up add organization modal
    const addOrgBtn = document.getElementById('add-organization-btn');
    if (addOrgBtn) {
        addOrgBtn.addEventListener('click', showAddOrganizationModal);
    }
});

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
