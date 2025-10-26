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
    }
    
    public class AuthResponse
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public User? User { get; set; }
        public string? Token { get; set; }
    }
}
