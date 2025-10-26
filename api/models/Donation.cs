using System.ComponentModel.DataAnnotations;

namespace FoodFlow.Models
{
    public class Donation
    {
        public int Id { get; set; }
        
        [Required]
        public string ItemName { get; set; } = string.Empty;
        
        [Required]
        public string Quantity { get; set; } = string.Empty;
        
        [Required]
        public string Category { get; set; } = string.Empty;
        
        [Required]
        public DateTime PickupStart { get; set; }
        
        [Required]
        public DateTime PickupEnd { get; set; }
        
        [Required]
        public DateTime SafeUntil { get; set; }
        
        [Required]
        public string Address { get; set; } = string.Empty;
        
        public string? Notes { get; set; }
        
        [Required]
        public int DonorId { get; set; }
        
        public string Status { get; set; } = "open"; // open, claimed, picked_up, expired
        
        public int? ClaimedByNonprofitId { get; set; }
        
        public int? AssignedDriverId { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        public DateTime? UpdatedAt { get; set; }
        
        // Navigation properties
        public User? Donor { get; set; }
        public User? ClaimedByNonprofit { get; set; }
        public User? AssignedDriver { get; set; }
    }
    
    public class CreateDonationRequest
    {
        [Required]
        public string ItemName { get; set; } = string.Empty;
        
        [Required]
        public string Quantity { get; set; } = string.Empty;
        
        [Required]
        public string Category { get; set; } = string.Empty;
        
        [Required]
        public DateTime PickupStart { get; set; }
        
        [Required]
        public DateTime PickupEnd { get; set; }
        
        [Required]
        public DateTime SafeUntil { get; set; }
        
        [Required]
        public string Address { get; set; } = string.Empty;
        
        public string? Notes { get; set; }
    }
    
    public class DonationResponse
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public Donation? Donation { get; set; }
    }
}
