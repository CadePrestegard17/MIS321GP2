// Donor new donation page specific functionality
document.addEventListener('DOMContentLoaded', function() {
    console.log('Donor new donation page loaded');
    
    // Initialize form
    initializeDonationForm();
    
    // Set up form submission
    const donationForm = document.getElementById('donation-form');
    if (donationForm) {
        donationForm.addEventListener('submit', handleDonationSubmission);
    }
});

function initializeDonationForm() {
    // Set current date as minimum for pickup date
    const pickupDateInput = document.getElementById('pickup-date');
    if (pickupDateInput) {
        const today = new Date().toISOString().split('T')[0];
        pickupDateInput.min = today;
    }
    
    // Set current time as minimum for pickup time
    const pickupTimeInput = document.getElementById('pickup-time');
    if (pickupTimeInput) {
        const now = new Date();
        const timeString = now.toTimeString().slice(0, 5);
        pickupTimeInput.min = timeString;
    }
}

async function handleDonationSubmission(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const donationData = {
        title: formData.get('title'),
        description: formData.get('description'),
        category: formData.get('category'),
        quantity: formData.get('quantity'),
        unit: formData.get('unit'),
        pickupDate: formData.get('pickup-date'),
        pickupTime: formData.get('pickup-time'),
        address: formData.get('address'),
        city: formData.get('city'),
        state: formData.get('state'),
        zipCode: formData.get('zip-code'),
        contactPhone: formData.get('contact-phone'),
        specialInstructions: formData.get('special-instructions')
    };
    
    console.log('Submitting donation:', donationData);
    
    try {
        // TODO: Replace with actual API call
        // const response = await fetch('/api/donations', {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify(donationData)
        // });
        
        // For now, just show success message
        showToast('Donation posted successfully!', 'success');
        
        // Reset form
        event.target.reset();
        
    } catch (error) {
        console.error('Error posting donation:', error);
        showToast('Error posting donation. Please try again.', 'danger');
    }
}
