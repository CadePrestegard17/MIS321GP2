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
                
                // Add address columns if they don't exist
                try
                {
                    var addAddressColumnsSql = @"
                        ALTER TABLE users 
                        ADD COLUMN address VARCHAR(255) NULL,
                        ADD COLUMN city VARCHAR(100) NULL,
                        ADD COLUMN state VARCHAR(50) NULL,
                        ADD COLUMN zip_code VARCHAR(20) NULL,
                        ADD COLUMN country VARCHAR(100) NULL,
                        ADD COLUMN organization_name VARCHAR(255) NULL,
                        ADD COLUMN organization_type VARCHAR(100) NULL,
                        ADD COLUMN business_name VARCHAR(255) NULL,
                        ADD COLUMN business_type VARCHAR(100) NULL";
                    
                    using var addColumnsCmd = new MySqlCommand(addAddressColumnsSql, connection);
                    addColumnsCmd.ExecuteNonQuery();
                    Console.WriteLine("Address columns added to users table");
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Columns may already exist: {ex.Message}");
                }
                
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
        
        [HttpPost("create-test-donation")]
        public async Task<ActionResult<object>> CreateTestDonation([FromBody] object request)
        {
            try
            {
                using var connection = new MySqlConnection(_database.cs);
                connection.Open();
                
                var insertSql = @"
                    INSERT INTO donations (item_name, quantity, category, pickup_start, pickup_end, 
                                        safe_until, address, notes, donor_id, status)
                    VALUES (@item_name, @quantity, @category, @pickup_start, @pickup_end, 
                            @safe_until, @address, @notes, @donor_id, @status)";
                
                using var insertCmd = new MySqlCommand(insertSql, connection);
                insertCmd.Parameters.AddWithValue("@item_name", "Test Business Donation");
                insertCmd.Parameters.AddWithValue("@quantity", "40 lbs");
                insertCmd.Parameters.AddWithValue("@category", "Produce");
                insertCmd.Parameters.AddWithValue("@pickup_start", DateTime.UtcNow.AddHours(1));
                insertCmd.Parameters.AddWithValue("@pickup_end", DateTime.UtcNow.AddHours(12));
                insertCmd.Parameters.AddWithValue("@safe_until", DateTime.UtcNow.AddDays(2));
                insertCmd.Parameters.AddWithValue("@address", "123 Business St, Tuscaloosa, AL 35401");
                insertCmd.Parameters.AddWithValue("@notes", "Test donation from business");
                insertCmd.Parameters.AddWithValue("@donor_id", 17); // User with organization name
                insertCmd.Parameters.AddWithValue("@status", "open");
                
                await insertCmd.ExecuteNonQueryAsync();
                
                return Ok(new { 
                    success = true, 
                    message = "Test donation created successfully",
                    donorId = 17
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error creating test donation: {ex.Message}");
                return StatusCode(500, new { error = ex.Message });
            }
        }

        [HttpGet("check-columns")]
        public async Task<ActionResult<object>> CheckColumns()
        {
            try
            {
                using var connection = new MySqlConnection(_database.cs);
                connection.Open();
                
                var sql = "DESCRIBE users";
                using var cmd = new MySqlCommand(sql, connection);
                using var reader = await cmd.ExecuteReaderAsync();
                
                var columns = new List<object>();
                while (await reader.ReadAsync())
                {
                    columns.Add(new
                    {
                        Field = reader.GetString(0),
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
                Console.WriteLine($"Error checking columns: {ex.Message}");
                return StatusCode(500, new { error = ex.Message });
            }
        }

        [HttpGet("test-complex-join")]
        public async Task<ActionResult<object>> TestComplexJoin()
        {
            try
            {
                using var connection = new MySqlConnection(_database.cs);
                connection.Open();
                
                var sql = @"
                    SELECT d.id, d.item_name, d.quantity, d.category, d.pickup_start, d.pickup_end, 
                           d.safe_until, d.address, d.notes, d.donor_id, d.status, d.created_at,
                           u.first_name, u.last_name, u.business_name, u.organization_name
                    FROM donations d
                    LEFT JOIN users u ON d.donor_id = u.id
                    WHERE d.id = 15";
                
                using var cmd = new MySqlCommand(sql, connection);
                using var reader = await cmd.ExecuteReaderAsync();
                
                if (await reader.ReadAsync())
                {
                    // Debug: log the values
                    Console.WriteLine($"Donation ID: {reader.GetInt32(0)}");
                    Console.WriteLine($"Donor ID: {reader.GetInt32(9)}");
                    Console.WriteLine($"First Name (index 12): {(reader.IsDBNull(12) ? "NULL" : reader.GetString(12))}");
                    Console.WriteLine($"Last Name (index 13): {(reader.IsDBNull(13) ? "NULL" : reader.GetString(13))}");
                    Console.WriteLine($"Business Name (index 14): {(reader.IsDBNull(14) ? "NULL" : reader.GetString(14))}");
                    Console.WriteLine($"Organization Name (index 15): {(reader.IsDBNull(15) ? "NULL" : reader.GetString(15))}");
                    
                    return Ok(new
                    {
                        id = reader.GetInt32(0),
                        itemName = reader.GetString(1),
                        quantity = reader.GetString(2),
                        category = reader.GetString(3),
                        pickupStart = reader.GetDateTime(4),
                        pickupEnd = reader.GetDateTime(5),
                        safeUntil = reader.GetDateTime(6),
                        address = reader.GetString(7),
                        notes = reader.IsDBNull(8) ? null : reader.GetString(8),
                        donorId = reader.GetInt32(9),
                        status = reader.GetString(10),
                        createdAt = reader.GetDateTime(11),
                        donor = new
                        {
                            firstName = reader.IsDBNull(12) ? null : reader.GetString(12),
                            lastName = reader.IsDBNull(13) ? null : reader.GetString(13),
                            businessName = reader.IsDBNull(14) ? null : reader.GetString(14),
                            organizationName = reader.IsDBNull(15) ? null : reader.GetString(15)
                        }
                    });
                }
                
                return Ok(new { message = "No donation found" });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error testing complex join: {ex.Message}");
                return StatusCode(500, new { error = ex.Message });
            }
        }

        [HttpGet("donations-with-donors")]
        public async Task<ActionResult<object>> GetDonationsWithDonors()
        {
            try
            {
                using var connection = new MySqlConnection(_database.cs);
                connection.Open();
                
                var sql = @"
                    SELECT d.id, d.item_name, d.quantity, d.category, d.pickup_start, d.pickup_end, 
                           d.safe_until, d.address, d.notes, d.donor_id, d.status, d.created_at,
                           u.first_name, u.last_name, u.business_name, u.organization_name
                    FROM donations d
                    LEFT JOIN users u ON d.donor_id = u.id
                    WHERE d.status = 'open'
                    ORDER BY d.created_at DESC";
                
                using var cmd = new MySqlCommand(sql, connection);
                using var reader = await cmd.ExecuteReaderAsync();
                
                var donations = new List<object>();
                while (await reader.ReadAsync())
                {
                    donations.Add(new
                    {
                        id = reader.GetInt32(0),
                        itemName = reader.GetString(1),
                        quantity = reader.GetString(2),
                        category = reader.GetString(3),
                        pickupStart = reader.GetDateTime(4),
                        pickupEnd = reader.GetDateTime(5),
                        safeUntil = reader.GetDateTime(6),
                        address = reader.GetString(7),
                        notes = reader.IsDBNull(8) ? null : reader.GetString(8),
                        donorId = reader.GetInt32(9),
                        status = reader.GetString(10),
                        createdAt = reader.GetDateTime(11),
                        donor = new
                        {
                            firstName = reader.IsDBNull(12) ? null : reader.GetString(12),
                            lastName = reader.IsDBNull(13) ? null : reader.GetString(13),
                            businessName = reader.IsDBNull(14) ? null : reader.GetString(14),
                            organizationName = reader.IsDBNull(15) ? null : reader.GetString(15)
                        }
                    });
                }
                
                return Ok(new { donations });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error getting donations: {ex.Message}");
                return StatusCode(500, new { error = ex.Message });
            }
        }

        [HttpGet("test-donations")]
        public ActionResult<object> TestDonations()
        {
            return Ok(new { message = "Testing donations from AuthController", timestamp = DateTime.UtcNow });
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
                           account_status, email_verified, created_at, last_login,
                           organization_name, organization_type, business_name, business_type,
                           address, city, state, zip_code, country
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
                        OrganizationName = reader.IsDBNull(10) ? null : reader.GetString(10),
                        OrganizationType = reader.IsDBNull(11) ? null : reader.GetString(11),
                        BusinessName = reader.IsDBNull(12) ? null : reader.GetString(12),
                        BusinessType = reader.IsDBNull(13) ? null : reader.GetString(13),
                        Address = reader.IsDBNull(14) ? null : reader.GetString(14),
                        City = reader.IsDBNull(15) ? null : reader.GetString(15),
                        State = reader.IsDBNull(16) ? null : reader.GetString(16),
                        ZipCode = reader.IsDBNull(17) ? null : reader.GetString(17),
                        Country = reader.IsDBNull(18) ? null : reader.GetString(18),
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
                    INSERT INTO users (email, password_hash, first_name, last_name, role, 
                                     organization_name, organization_type, business_name, business_type,
                                     address, city, state, zip_code, country)
                    VALUES (@email, @password_hash, @first_name, @last_name, @role,
                            @organization_name, @organization_type, @business_name, @business_type,
                            @address, @city, @state, @zip_code, @country)";
                
                using var insertUserCmd = new MySqlCommand(insertUserSql, connection);
                insertUserCmd.Parameters.AddWithValue("@email", request.Email.ToLower());
                insertUserCmd.Parameters.AddWithValue("@password_hash", PasswordHasher.HashPassword(request.Password));
                insertUserCmd.Parameters.AddWithValue("@first_name", request.FirstName);
                insertUserCmd.Parameters.AddWithValue("@last_name", request.LastName);
                insertUserCmd.Parameters.AddWithValue("@role", roleString);
                insertUserCmd.Parameters.AddWithValue("@organization_name", request.OrganizationName ?? (string?)null);
                insertUserCmd.Parameters.AddWithValue("@organization_type", request.OrganizationType ?? (string?)null);
                insertUserCmd.Parameters.AddWithValue("@business_name", request.BusinessName ?? (string?)null);
                insertUserCmd.Parameters.AddWithValue("@business_type", request.BusinessType ?? (string?)null);
                insertUserCmd.Parameters.AddWithValue("@address", request.Address ?? (string?)null);
                insertUserCmd.Parameters.AddWithValue("@city", request.City ?? (string?)null);
                insertUserCmd.Parameters.AddWithValue("@state", request.State ?? (string?)null);
                insertUserCmd.Parameters.AddWithValue("@zip_code", request.ZipCode ?? (string?)null);
                insertUserCmd.Parameters.AddWithValue("@country", request.Country ?? (string?)null);
                
                await insertUserCmd.ExecuteNonQueryAsync();
                
                // Get the inserted user
                var userId = (int)insertUserCmd.LastInsertedId;
                
                var getUserSql = @"
                    SELECT id, email, password_hash, first_name, last_name, role, 
                           account_status, email_verified, created_at, last_login,
                           organization_name, organization_type, business_name, business_type,
                           address, city, state, zip_code, country
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
                    OrganizationName = reader.IsDBNull(10) ? null : reader.GetString(10),
                    OrganizationType = reader.IsDBNull(11) ? null : reader.GetString(11),
                    BusinessName = reader.IsDBNull(12) ? null : reader.GetString(12),
                    BusinessType = reader.IsDBNull(13) ? null : reader.GetString(13),
                    Address = reader.IsDBNull(14) ? null : reader.GetString(14),
                    City = reader.IsDBNull(15) ? null : reader.GetString(15),
                    State = reader.IsDBNull(16) ? null : reader.GetString(16),
                    ZipCode = reader.IsDBNull(17) ? null : reader.GetString(17),
                    Country = reader.IsDBNull(18) ? null : reader.GetString(18),
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

        [HttpGet("debug/user-details/{email}")]
        public ActionResult<object> GetUserDetails(string email)
        {
            try
            {
                using var connection = new MySqlConnection(_database.cs);
                connection.Open();
                
                var getUserSql = @"
                    SELECT id, email, first_name, last_name, role, 
                           organization_name, organization_type, business_name, business_type,
                           address, city, state, zip_code, country
                    FROM users 
                    WHERE email = @email";
                
                using var getUserCmd = new MySqlCommand(getUserSql, connection);
                getUserCmd.Parameters.AddWithValue("@email", email);
                using var reader = getUserCmd.ExecuteReader();
                
                if (reader.Read())
                {
                    var user = new
                    {
                        Id = reader.GetInt32(0),
                        Email = reader.GetString(1),
                        FirstName = reader.GetString(2),
                        LastName = reader.GetString(3),
                        Role = reader.GetString(4),
                        OrganizationName = reader.IsDBNull(5) ? null : reader.GetString(5),
                        OrganizationType = reader.IsDBNull(6) ? null : reader.GetString(6),
                        BusinessName = reader.IsDBNull(7) ? null : reader.GetString(7),
                        BusinessType = reader.IsDBNull(8) ? null : reader.GetString(8),
                        Address = reader.IsDBNull(9) ? null : reader.GetString(9),
                        City = reader.IsDBNull(10) ? null : reader.GetString(10),
                        State = reader.IsDBNull(11) ? null : reader.GetString(11),
                        ZipCode = reader.IsDBNull(12) ? null : reader.GetString(12),
                        Country = reader.IsDBNull(13) ? null : reader.GetString(13)
                    };
                    
                    return Ok(new { user });
                }
                
                return NotFound(new { error = "User not found" });
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

        [HttpPost("debug/add-columns")]
        public ActionResult<object> AddAddressColumns()
        {
            try
            {
                using var connection = new MySqlConnection(_database.cs);
                connection.Open();
                
                var addAddressColumnsSql = @"
                    ALTER TABLE users 
                    ADD COLUMN address VARCHAR(255) NULL,
                    ADD COLUMN city VARCHAR(100) NULL,
                    ADD COLUMN state VARCHAR(50) NULL,
                    ADD COLUMN zip_code VARCHAR(20) NULL,
                    ADD COLUMN country VARCHAR(100) NULL,
                    ADD COLUMN organization_name VARCHAR(255) NULL,
                    ADD COLUMN organization_type VARCHAR(100) NULL,
                    ADD COLUMN business_name VARCHAR(255) NULL,
                    ADD COLUMN business_type VARCHAR(100) NULL";
                
                using var addColumnsCmd = new MySqlCommand(addAddressColumnsSql, connection);
                addColumnsCmd.ExecuteNonQuery();
                
                return Ok(new { 
                    success = true, 
                    message = "Address columns added successfully"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { 
                    success = false,
                    error = ex.Message,
                    message = "Columns may already exist or there was an error"
                });
            }
        }

        [HttpPost("debug/update-address")]
        public ActionResult<object> UpdateUserAddress([FromBody] UpdateAddressRequest request)
        {
            try
            {
                using var connection = new MySqlConnection(_database.cs);
                connection.Open();
                
                var updateAddressSql = @"
                    UPDATE users 
                    SET address = @address, city = @city, state = @state, 
                        zip_code = @zip_code, country = @country,
                        organization_name = @organization_name, organization_type = @organization_type
                    WHERE email = @email";
                
                using var updateCmd = new MySqlCommand(updateAddressSql, connection);
                updateCmd.Parameters.AddWithValue("@email", request.Email);
                updateCmd.Parameters.AddWithValue("@address", request.Address);
                updateCmd.Parameters.AddWithValue("@city", request.City);
                updateCmd.Parameters.AddWithValue("@state", request.State);
                updateCmd.Parameters.AddWithValue("@zip_code", request.ZipCode);
                updateCmd.Parameters.AddWithValue("@country", request.Country);
                updateCmd.Parameters.AddWithValue("@organization_name", request.OrganizationName ?? (string?)null);
                updateCmd.Parameters.AddWithValue("@organization_type", request.OrganizationType ?? (string?)null);
                
                var rowsAffected = updateCmd.ExecuteNonQuery();
                
                return Ok(new { 
                    success = true, 
                    message = "Address updated successfully",
                    rowsAffected = rowsAffected
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { 
                    success = false,
                    error = ex.Message
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
