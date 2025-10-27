// Login page specific functionality
document.addEventListener('DOMContentLoaded', function() {
    console.log('Login page loaded');
    
    // Handle form switching between login and registration
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const showLoginLink = document.getElementById('show-login');
    const showRegisterLink = document.getElementById('show-register');
    
    if (showLoginLink && showRegisterLink) {
        showLoginLink.addEventListener('click', function(e) {
            e.preventDefault();
            loginForm.style.display = 'block';
            registerForm.style.display = 'none';
        });
        
        showRegisterLink.addEventListener('click', function(e) {
            e.preventDefault();
            loginForm.style.display = 'none';
            registerForm.style.display = 'block';
        });
    }
    
    // Handle role-specific field visibility
    const roleSelect = document.getElementById('role');
    const donorFields = document.getElementById('donor-fields');
    const nonprofitFields = document.getElementById('nonprofit-fields');
    
    if (roleSelect && donorFields && nonprofitFields) {
        roleSelect.addEventListener('change', function() {
            const role = this.value;
            
            // Get role-specific input fields
            const businessName = document.getElementById('business-name');
            const businessType = document.getElementById('business-type');
            const orgName = document.getElementById('org-name');
            const orgType = document.getElementById('org-type');
            
            // Hide all role-specific fields and remove required attribute
            donorFields.style.display = 'none';
            nonprofitFields.style.display = 'none';
            businessType?.removeAttribute('required');
            orgType?.removeAttribute('required');
            
            // Show relevant fields based on role
            if (role === '1') { // Donor
                donorFields.style.display = 'block';
                businessType?.setAttribute('required', 'required');
            } else if (role === '2') { // Nonprofit
                nonprofitFields.style.display = 'block';
                orgType?.setAttribute('required', 'required');
            }
        });
    }
});
