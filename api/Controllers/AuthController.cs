using Microsoft.AspNetCore.Mvc;
using FoodFlow.Models;
using FoodFlow.Utils;
using FoodFlow.Database;
using FoodFlow.Services;
using System.Text.Json;

namespace FoodFlow.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly Database.Database _database;
        
        // In-memory storage for registered users (in production, use database)
        private static readonly Dictionary<string, User> _registeredUsers = new Dictionary<string, User>();
        
        public AuthController()
        {
            _database = new Database.Database();
        }
        
        [HttpPost("login")]
        public async Task<ActionResult<AuthResponse>> Login([FromBody] LoginRequest request)
        {
            try
            {
                // For now, handle admin login specially
                if (request.Email == "admin@food.com" && request.Password == "password123")
                {
                    var adminUser = new User
                    {
                        Id = 1,
                        Email = "admin@food.com",
                        PasswordHash = PasswordHasher.HashPassword("password123"),
                        FirstName = "Admin",
                        LastName = "User",
                        Role = UserRole.Admin,
                        CreatedAt = DateTime.UtcNow,
                        LastLoginAt = DateTime.UtcNow
                    };
                    
                    return Ok(new AuthResponse
                    {
                        Success = true,
                        Message = "Login successful",
                        User = adminUser
                    });
                }
                
                // Check registered users
                var emailKey = request.Email.ToLower();
                if (_registeredUsers.ContainsKey(emailKey))
                {
                    var user = _registeredUsers[emailKey];
                    
                    // Verify password
                    if (PasswordHasher.VerifyPassword(request.Password, user.PasswordHash))
                    {
                        // Update last login
                        user.LastLoginAt = DateTime.UtcNow;
                        _registeredUsers[emailKey] = user;
                        
                        return Ok(new AuthResponse
                        {
                            Success = true,
                            Message = "Login successful",
                            User = user
                        });
                    }
                }
                
                return BadRequest(new AuthResponse
                {
                    Success = false,
                    Message = "Invalid email or password"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new AuthResponse
                {
                    Success = false,
                    Message = "An error occurred during login"
                });
            }
        }
        
        [HttpPost("register")]
        public async Task<ActionResult<AuthResponse>> Register([FromBody] RegisterRequest request)
        {
            try
            {
                // Check if email already exists (including admin email)
                if (request.Email == "admin@food.com")
                {
                    return BadRequest(new AuthResponse
                    {
                        Success = false,
                        Message = "This email is reserved for admin use"
                    });
                }
                
                // Check if email already exists
                var emailKey = request.Email.ToLower();
                if (_registeredUsers.ContainsKey(emailKey))
                {
                    return BadRequest(new AuthResponse
                    {
                        Success = false,
                        Message = "An account with this email already exists"
                    });
                }
                
                // Validate role-specific fields
                if (request.Role == UserRole.Donor)
                {
                    if (string.IsNullOrEmpty(request.BusinessName) || string.IsNullOrEmpty(request.BusinessType))
                    {
                        return BadRequest(new AuthResponse
                        {
                            Success = false,
                            Message = "Business name and type are required for donors"
                        });
                    }
                }
                else if (request.Role == UserRole.Nonprofit)
                {
                    if (string.IsNullOrEmpty(request.OrganizationName) || string.IsNullOrEmpty(request.OrganizationType))
                    {
                        return BadRequest(new AuthResponse
                        {
                            Success = false,
                            Message = "Organization name and type are required for nonprofits"
                        });
                    }
                }
                
                var user = new User
                {
                    Id = _registeredUsers.Count + 2, // Start from 2 (admin is 1)
                    Email = request.Email,
                    PasswordHash = PasswordHasher.HashPassword(request.Password),
                    FirstName = request.FirstName,
                    LastName = request.LastName,
                    Role = request.Role,
                    BusinessName = request.BusinessName,
                    BusinessType = request.BusinessType,
                    OrganizationName = request.OrganizationName,
                    OrganizationType = request.OrganizationType,
                    CreatedAt = DateTime.UtcNow
                };
                
                // Store user in memory
                _registeredUsers[emailKey] = user;
                
                return Ok(new AuthResponse
                {
                    Success = true,
                    Message = "Registration successful",
                    User = user
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new AuthResponse
                {
                    Success = false,
                    Message = "An error occurred during registration"
                });
            }
        }
        
        [HttpGet("roles")]
        public ActionResult<object> GetRoles()
        {
            return Ok(new
            {
                roles = new[]
                {
                    new { value = (int)UserRole.Donor, label = "Donor" },
                    new { value = (int)UserRole.Nonprofit, label = "Nonprofit" },
                    new { value = (int)UserRole.Driver, label = "Driver" }
                }
            });
        }
    }
}
