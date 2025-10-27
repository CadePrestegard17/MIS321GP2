using System.ComponentModel.DataAnnotations;

namespace FoodFlow.Models
{
    public class User
    {
        public int Id { get; set; }
        
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;
        
        [Required]
        public string PasswordHash { get; set; } = string.Empty;
        
        [Required]
        public string FirstName { get; set; } = string.Empty;
        
        [Required]
        public string LastName { get; set; } = string.Empty;
        
        [Required]
        public UserRole Role { get; set; }
        
        // Role-specific fields
        public string? BusinessName { get; set; }
        public string? BusinessType { get; set; }
        public string? OrganizationName { get; set; }
        public string? OrganizationType { get; set; }
        
        // Address fields for nonprofits and donors
        public string? Address { get; set; }
        public string? City { get; set; }
        public string? State { get; set; }
        public string? ZipCode { get; set; }
        public string? Country { get; set; }
        
        // Driver-specific fields
        public string? ServiceCity { get; set; }
        public int? ServiceRadiusMiles { get; set; }
        public string? PreferredAreas { get; set; } // JSON array of zip codes or neighborhoods
        public bool IsAvailable { get; set; } = true;
        public string? VehicleType { get; set; }
        public string? LicensePlate { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? LastLoginAt { get; set; }
    }
    
    public enum UserRole
    {
        Donor = 1,
        Nonprofit = 2,
        Driver = 3,
        Admin = 4
    }
    
    public class LoginRequest
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;
        
        [Required]
        public string Password { get; set; } = string.Empty;
    }
    
    public class RegisterRequest
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;
        
        [Required]
        [MinLength(6)]
        public string Password { get; set; } = string.Empty;
        
        [Required]
        public string FirstName { get; set; } = string.Empty;
        
        [Required]
        public string LastName { get; set; } = string.Empty;
        
        [Required]
        public UserRole Role { get; set; }
        
        // Role-specific fields
        public string? BusinessName { get; set; }
        public string? BusinessType { get; set; }
        public string? OrganizationName { get; set; }
        public string? OrganizationType { get; set; }
        
        // Address fields for nonprofits and donors
        public string? Address { get; set; }
        public string? City { get; set; }
        public string? State { get; set; }
        public string? ZipCode { get; set; }
        public string? Country { get; set; }
    }
    
    public class AuthResponse
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public User? User { get; set; }
        public string? Token { get; set; }
    }

    public class UpdateAddressRequest
    {
        public string Email { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public string City { get; set; } = string.Empty;
        public string State { get; set; } = string.Empty;
        public string ZipCode { get; set; } = string.Empty;
        public string Country { get; set; } = string.Empty;
        public string? OrganizationName { get; set; }
        public string? OrganizationType { get; set; }
    }
    
    public class UpdateDriverProfileRequest
    {
        public string Email { get; set; } = string.Empty;
        public string ServiceCity { get; set; } = string.Empty;
        public int ServiceRadiusMiles { get; set; }
        public string? PreferredAreas { get; set; }
        public bool IsAvailable { get; set; } = true;
        public string VehicleType { get; set; } = string.Empty;
        public string LicensePlate { get; set; } = string.Empty;
    }
}
