using Microsoft.AspNetCore.Mvc;
using FoodFlow.Models;
using FoodFlow.Utils;
using FoodFlow.Database;
using MySql.Data.MySqlClient;
using FoodFlow.Services;
using System.Text.Json;

namespace FoodFlow.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly Database.Database _database;
        
        // Temporary in-memory storage while debugging database connection
        private static readonly Dictionary<string, User> _registeredUsers = new Dictionary<string, User>();
        
        public AuthController()
        {
            _database = new Database.Database();
            InitializeDatabase(); // Re-enabled for proper database connection
            // InitializeInMemoryData(); // Disabled - using database now
        }
        
        private void InitializeDatabase()
        {
            try
            {
                using var connection = new MySqlConnection(_database.cs);
                connection.Open();
                
                // Check if admin exists, if not create it
                var checkAdminSql = "SELECT COUNT(*) FROM users WHERE email = 'admin@food.com'";
                using var checkAdminCmd = new MySqlCommand(checkAdminSql, connection);
                var adminExists = Convert.ToInt32(checkAdminCmd.ExecuteScalar()) > 0;
                
                if (!adminExists)
                {
                    // Insert admin with correct enum value
                    var insertAdminSql = @"
                        INSERT INTO users (email, password_hash, first_name, last_name, role)
                        VALUES ('admin@food.com', @password_hash, 'Admin', 'User', 'admin')";
                    
                    using var insertAdminCmd = new MySqlCommand(insertAdminSql, connection);
                    insertAdminCmd.Parameters.AddWithValue("@password_hash", PasswordHasher.HashPassword("password123"));
                    
                    insertAdminCmd.ExecuteNonQuery();
                    Console.WriteLine("Admin user created successfully");
                }
                else
                {
                    Console.WriteLine("Admin user already exists");
                }
                
                Console.WriteLine("Database initialized successfully");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error initializing database: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
            }
        }
        
        private void InitializeInMemoryData()
        {
            // Create admin user in memory
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
            
            _registeredUsers["admin@food.com"] = adminUser;
            Console.WriteLine("In-memory data initialized with admin user");
        }
        
        [HttpPost("login")]
        public async Task<ActionResult<AuthResponse>> Login([FromBody] LoginRequest request)
        {
            try
            {
                using var connection = new MySqlConnection(_database.cs);
                connection.Open();
                
                // Get user from database with correct column names
                var getUserSql = @"
                    SELECT id, email, password_hash, first_name, last_name, role, 
                           account_status, email_verified, created_at, last_login
                    FROM users 
                    WHERE email = @email";
                
                using var getUserCmd = new MySqlCommand(getUserSql, connection);
                getUserCmd.Parameters.AddWithValue("@email", request.Email.ToLower());
                
                using var reader = await getUserCmd.ExecuteReaderAsync();
                
                if (await reader.ReadAsync())
                {
                    // Convert enum role to integer
                    var roleString = reader.GetString(5);
                    var role = roleString switch
                    {
                        "donor" => UserRole.Donor,
                        "nonprofit" => UserRole.Nonprofit,
                        "driver" => UserRole.Driver,
                        "admin" => UserRole.Admin,
                        _ => UserRole.Donor
                    };
                    
                    var user = new User
                    {
                        Id = reader.GetInt32(0),
                        Email = reader.GetString(1),
                        PasswordHash = reader.GetString(2),
                        FirstName = reader.GetString(3),
                        LastName = reader.GetString(4),
                        Role = role,
                        CreatedAt = reader.IsDBNull(8) ? DateTime.UtcNow : reader.GetDateTime(8),
                        LastLoginAt = reader.IsDBNull(9) ? null : reader.GetDateTime(9)
                    };
                    
                    // Verify password
                    if (PasswordHasher.VerifyPassword(request.Password, user.PasswordHash))
                    {
                        // Update last login
                        reader.Close();
                        var updateLoginSql = "UPDATE users SET last_login = @last_login WHERE id = @id";
                        using var updateLoginCmd = new MySqlCommand(updateLoginSql, connection);
                        updateLoginCmd.Parameters.AddWithValue("@last_login", DateTime.UtcNow);
                        updateLoginCmd.Parameters.AddWithValue("@id", user.Id);
                        await updateLoginCmd.ExecuteNonQueryAsync();
                        
                        user.LastLoginAt = DateTime.UtcNow;
                        
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
                Console.WriteLine($"Login error: {ex.Message}");
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
                // Temporarily allow admin registration for testing
                // if (request.Email == "admin@food.com")
                // {
                //     return BadRequest(new AuthResponse
                //     {
                //         Success = false,
                //         Message = "This email is reserved for admin use"
                //     });
                // }
                
                using var connection = new MySqlConnection(_database.cs);
                connection.Open();
                
                // Check if email already exists in database
                var checkEmailSql = "SELECT COUNT(*) FROM users WHERE email = @email";
                using var checkEmailCmd = new MySqlCommand(checkEmailSql, connection);
                checkEmailCmd.Parameters.AddWithValue("@email", request.Email.ToLower());
                
                var emailExists = Convert.ToInt32(await checkEmailCmd.ExecuteScalarAsync()) > 0;
                
                if (emailExists)
                {
                    return BadRequest(new AuthResponse
                    {
                        Success = false,
                        Message = "An account with this email already exists"
                    });
                }
                
                // Convert role to enum string
                var roleString = request.Role switch
                {
                    UserRole.Donor => "donor",
                    UserRole.Nonprofit => "nonprofit",
                    UserRole.Driver => "driver",
                    UserRole.Admin => "admin",
                    _ => "donor"
                };
                
                // Insert new user into database with correct schema
                var insertUserSql = @"
                    INSERT INTO users (email, password_hash, first_name, last_name, role)
                    VALUES (@email, @password_hash, @first_name, @last_name, @role)";
                
                using var insertUserCmd = new MySqlCommand(insertUserSql, connection);
                insertUserCmd.Parameters.AddWithValue("@email", request.Email.ToLower());
                insertUserCmd.Parameters.AddWithValue("@password_hash", PasswordHasher.HashPassword(request.Password));
                insertUserCmd.Parameters.AddWithValue("@first_name", request.FirstName);
                insertUserCmd.Parameters.AddWithValue("@last_name", request.LastName);
                insertUserCmd.Parameters.AddWithValue("@role", roleString);
                
                await insertUserCmd.ExecuteNonQueryAsync();
                
                // Get the inserted user
                var userId = (int)insertUserCmd.LastInsertedId;
                
                var getUserSql = @"
                    SELECT id, email, password_hash, first_name, last_name, role, 
                           account_status, email_verified, created_at, last_login
                    FROM users 
                    WHERE id = @id";
                
                using var getUserCmd = new MySqlCommand(getUserSql, connection);
                getUserCmd.Parameters.AddWithValue("@id", userId);
                
                using var reader = await getUserCmd.ExecuteReaderAsync();
                await reader.ReadAsync();
                
                // Convert enum role back to integer
                var roleStringFromDb = reader.GetString(5);
                var roleFromDb = roleStringFromDb switch
                {
                    "donor" => UserRole.Donor,
                    "nonprofit" => UserRole.Nonprofit,
                    "driver" => UserRole.Driver,
                    "admin" => UserRole.Admin,
                    _ => UserRole.Donor
                };
                
                var user = new User
                {
                    Id = reader.GetInt32(0),
                    Email = reader.GetString(1),
                    PasswordHash = reader.GetString(2),
                    FirstName = reader.GetString(3),
                    LastName = reader.GetString(4),
                    Role = roleFromDb,
                    CreatedAt = reader.IsDBNull(8) ? DateTime.UtcNow : reader.GetDateTime(8),
                    LastLoginAt = reader.IsDBNull(9) ? null : reader.GetDateTime(9)
                };
                
                return Ok(new AuthResponse
                {
                    Success = true,
                    Message = "Registration successful",
                    User = user
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Registration error: {ex.Message}");
                return StatusCode(500, new AuthResponse
                {
                    Success = false,
                    Message = "An error occurred during registration"
                });
            }
        }
        
        [HttpGet("debug/schema")]
        public ActionResult<object> GetDatabaseSchema()
        {
            try
            {
                using var connection = new MySqlConnection(_database.cs);
                connection.Open();
                
                var describeTableSql = "DESCRIBE users";
                using var describeCmd = new MySqlCommand(describeTableSql, connection);
                using var reader = describeCmd.ExecuteReader();
                
                var columns = new List<object>();
                while (reader.Read())
                {
                    columns.Add(new
                    {
                        Column = reader.GetString(0),
                        Type = reader.GetString(1),
                        Null = reader.GetString(2),
                        Key = reader.GetString(3),
                        Default = reader.IsDBNull(4) ? null : reader.GetString(4),
                        Extra = reader.IsDBNull(5) ? null : reader.GetString(5)
                    });
                }
                
                return Ok(new { columns });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }
        
        [HttpGet("debug/users")]
        public ActionResult<object> GetUsers()
        {
            try
            {
                using var connection = new MySqlConnection(_database.cs);
                connection.Open();
                
                var getUsersSql = "SELECT id, email, first_name, last_name, role FROM users";
                using var getUsersCmd = new MySqlCommand(getUsersSql, connection);
                using var reader = getUsersCmd.ExecuteReader();
                
                var users = new List<object>();
                while (reader.Read())
                {
                    users.Add(new
                    {
                        Id = reader.GetInt32(0),
                        Email = reader.GetString(1),
                        FirstName = reader.GetString(2),
                        LastName = reader.GetString(3),
                        Role = reader.GetString(4)
                    });
                }
                
                return Ok(new { users });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }
        
        [HttpPost("debug/reset-admin")]
        public ActionResult<object> ResetAdminPassword()
        {
            try
            {
                using var connection = new MySqlConnection(_database.cs);
                connection.Open();
                
                var updateAdminSql = "UPDATE users SET password_hash = @password_hash WHERE email = 'admin@food.com'";
                using var updateAdminCmd = new MySqlCommand(updateAdminSql, connection);
                updateAdminCmd.Parameters.AddWithValue("@password_hash", PasswordHasher.HashPassword("password123"));
                
                var rowsAffected = updateAdminCmd.ExecuteNonQuery();
                
                return Ok(new { 
                    success = true, 
                    message = "Admin password reset successfully",
                    rowsAffected = rowsAffected
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
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
