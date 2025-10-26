// Donor New Donation Page JavaScript
console.log('Donor new donation page loaded');

let map;
let marker;

// Initialize the donation form
document.addEventListener('DOMContentLoaded', function() {
    initializeDonationForm();
    initializeMap();
});

function initializeDonationForm() {
    const form = document.getElementById('donation-form');
    if (form) {
        form.addEventListener('submit', handleDonationSubmission);
        
        // Set default dates
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        const safeUntil = new Date(today);
        safeUntil.setDate(safeUntil.getDate() + 2); // 2 days from now
        
        document.getElementById('pickupDate').value = formatDate(tomorrow);
        document.getElementById('safeUntil').value = formatDate(safeUntil);
        
        // Add event listeners to address fields
        const addressFields = ['address', 'city', 'state', 'zipcode', 'country'];
        addressFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                field.addEventListener('input', debounce(updateMapFromAddress, 1000));
            }
        });
    }
}

function initializeMap() {
    // Initialize map centered on a default location (e.g., Springfield, IL)
    map = L.map('map').setView([39.7817, -89.6501], 13);
    
    // Add OpenStreetMap tiles with custom styling
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
    }).addTo(map);
    
    // Create custom marker icon
    const pickupIcon = L.divIcon({
        className: 'custom-pickup-marker',
        html: '<div class="marker-pin"><i class="bi bi-geo-alt-fill"></i></div>',
        iconSize: [30, 30],
        iconAnchor: [15, 30],
        popupAnchor: [0, -30]
    });
    
    // Add initial marker with custom icon
    marker = L.marker([39.7817, -89.6501], { icon: pickupIcon }).addTo(map);
    marker.bindPopup('<div class="text-center"><strong>Pickup Location</strong><br><small class="text-muted">Enter your address to update</small></div>').openPopup();
}

function updateMapFromAddress() {
    const address = getFullAddress();
    if (address && address.length > 10) { // Only search if we have a reasonable address
        geocodeAddress(address);
    }
}

function getFullAddress() {
    const address = document.getElementById('address').value;
    const city = document.getElementById('city').value;
    const state = document.getElementById('state').value;
    const zipcode = document.getElementById('zipcode').value;
    const country = document.getElementById('country').value;
    
    return `${address}, ${city}, ${state} ${zipcode}, ${country}`.trim();
}

function geocodeAddress(address) {
    // Use Nominatim (OpenStreetMap's geocoding service) - free and no API key required
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`;
    
    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data && data.length > 0) {
                const result = data[0];
                const lat = parseFloat(result.lat);
                const lon = parseFloat(result.lon);
                
                // Create custom marker icon for updates
                const pickupIcon = L.divIcon({
                    className: 'custom-pickup-marker',
                    html: '<div class="marker-pin"><i class="bi bi-geo-alt-fill"></i></div>',
                    iconSize: [30, 30],
                    iconAnchor: [15, 30],
                    popupAnchor: [0, -30]
                });
                
                // Update map view and marker
                map.setView([lat, lon], 15);
                marker.setLatLng([lat, lon]);
                marker.setIcon(pickupIcon);
                marker.bindPopup(`<div class="text-center"><strong>Pickup Location</strong><br><small class="text-muted">${address}</small></div>`).openPopup();
            }
        })
        .catch(error => {
            console.log('Geocoding error:', error);
            // Don't show error to user, just keep the map as is
        });
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
}

async function handleDonationSubmission(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    
    // Get the pickup date and create pickup start/end times
    const pickupDate = new Date(formData.get('pickupDate'));
    const safeUntilDate = new Date(formData.get('safeUntil'));
    
    // Set pickup times to 5 AM - 10 PM on the selected date
    const pickupStart = new Date(pickupDate);
    pickupStart.setHours(5, 0, 0, 0); // 5:00 AM
    
    const pickupEnd = new Date(pickupDate);
    pickupEnd.setHours(22, 0, 0, 0); // 10:00 PM
    
    // Set safe until to end of day
    const safeUntil = new Date(safeUntilDate);
    safeUntil.setHours(23, 59, 59, 999); // End of day
    
    // Validate dates
    if (pickupDate < new Date()) {
        showAlert('Pickup date cannot be in the past', 'danger');
        return;
    }
    
    if (safeUntilDate <= pickupDate) {
        showAlert('Safe until date must be after pickup date', 'danger');
        return;
    }
    
    // Combine address fields
    const address = `${formData.get('address')}, ${formData.get('city')}, ${formData.get('state')} ${formData.get('zipcode')}, ${formData.get('country')}`;
    
    const donationData = {
        itemName: formData.get('itemName'),
        quantity: formData.get('quantity'),
        category: formData.get('category'),
        pickupStart: pickupStart.toISOString(),
        pickupEnd: pickupEnd.toISOString(),
        safeUntil: safeUntil.toISOString(),
        address: address,
        notes: formData.get('notes') || ''
    };
    
    try {
        showAlert('Creating donation...', 'info');
        
        const response = await fetch('/api/donation', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(donationData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            showAlert('Donation posted successfully! It will appear in the feed shortly.', 'success');
            form.reset();
            
            // Reset default dates
            const today = new Date();
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            
            const safeUntil = new Date(today);
            safeUntil.setDate(safeUntil.getDate() + 2);
            
            document.getElementById('pickupDate').value = formatDate(tomorrow);
            document.getElementById('safeUntil').value = formatDate(safeUntil);
            
            // Redirect to dashboard after a short delay
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 2000);
        } else {
            showAlert(result.message || 'Failed to create donation', 'danger');
        }
    } catch (error) {
        console.error('Error creating donation:', error);
        showAlert('An error occurred while creating the donation', 'danger');
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