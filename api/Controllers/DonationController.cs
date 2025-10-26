using Microsoft.AspNetCore.Mvc;
using MySql.Data.MySqlClient;
using FoodFlow.Models;
using FoodFlow.Database;

namespace FoodFlow.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DonationController : ControllerBase
    {
        private readonly Database.Database _database;

        public DonationController()
        {
            _database = new Database.Database();
            InitializeDatabase();
        }

        private void InitializeDatabase()
        {
            try
            {
                using var connection = new MySqlConnection(_database.cs);
                connection.Open();
                
                // Create donations table if it doesn't exist (without foreign keys for now)
                var createTableSql = @"
                    CREATE TABLE IF NOT EXISTS donations (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        item_name VARCHAR(255) NOT NULL,
                        quantity VARCHAR(100) NOT NULL,
                        category VARCHAR(50) NOT NULL,
                        pickup_start DATETIME NOT NULL,
                        pickup_end DATETIME NOT NULL,
                        safe_until DATETIME NOT NULL,
                        address TEXT NOT NULL,
                        notes TEXT,
                        donor_id INT NOT NULL,
                        status ENUM('open', 'claimed', 'picked_up', 'expired') DEFAULT 'open',
                        claimed_by_nonprofit_id INT NULL,
                        assigned_driver_id INT NULL,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP
                    )";
                
                using var createTableCmd = new MySqlCommand(createTableSql, connection);
                createTableCmd.ExecuteNonQuery();
                
                Console.WriteLine("Donations table initialized successfully");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error initializing donations table: {ex.Message}");
            }
        }

        [HttpPost("simple")]
        public async Task<ActionResult<object>> CreateDonationSimple([FromBody] CreateDonationRequest request)
        {
            try
            {
                Console.WriteLine("Starting simple donation creation...");
                
                var currentUser = GetCurrentUser();
                Console.WriteLine($"Current user: {currentUser?.Email}");
                
                if (currentUser == null)
                {
                    return BadRequest(new { success = false, message = "User not authenticated" });
                }

                using var connection = new MySqlConnection(_database.cs);
                connection.Open();
                Console.WriteLine("Database connection opened");
                
                var insertSql = @"
                    INSERT INTO donations (item_name, quantity, category, pickup_start, pickup_end, 
                                        safe_until, address, notes, donor_id, status)
                    VALUES (@item_name, @quantity, @category, @pickup_start, @pickup_end, 
                            @safe_until, @address, @notes, @donor_id, @status)";
                
                using var insertCmd = new MySqlCommand(insertSql, connection);
                insertCmd.Parameters.AddWithValue("@item_name", request.ItemName);
                insertCmd.Parameters.AddWithValue("@quantity", request.Quantity);
                insertCmd.Parameters.AddWithValue("@category", request.Category);
                insertCmd.Parameters.AddWithValue("@pickup_start", request.PickupStart);
                insertCmd.Parameters.AddWithValue("@pickup_end", request.PickupEnd);
                insertCmd.Parameters.AddWithValue("@safe_until", request.SafeUntil);
                insertCmd.Parameters.AddWithValue("@address", request.Address);
                insertCmd.Parameters.AddWithValue("@notes", request.Notes ?? "");
                insertCmd.Parameters.AddWithValue("@donor_id", currentUser.Id);
                insertCmd.Parameters.AddWithValue("@status", "open");
                
                Console.WriteLine("Executing insert command...");
                await insertCmd.ExecuteNonQueryAsync();
                Console.WriteLine("Insert completed");
                
                var donationId = (int)insertCmd.LastInsertedId;
                Console.WriteLine($"Donation ID: {donationId}");
                
                return Ok(new { 
                    success = true, 
                    message = "Donation created successfully",
                    donationId = donationId
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Simple donation creation error: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                return StatusCode(500, new { 
                    success = false, 
                    message = "An error occurred while creating the donation",
                    error = ex.Message
                });
            }
        }

        [HttpPost]
        public async Task<ActionResult<DonationResponse>> CreateDonation([FromBody] CreateDonationRequest request)
        {
            try
            {
                Console.WriteLine("Starting donation creation...");
                
                // Get current user from session/token (for now, we'll use a default donor)
                // In a real app, you'd get this from JWT token or session
                var currentUser = GetCurrentUser();
                Console.WriteLine($"Current user: {currentUser?.Email}");
                
                if (currentUser == null)
                {
                    Console.WriteLine("Current user is null!");
                    return BadRequest(new DonationResponse
                    {
                        Success = false,
                        Message = "User not authenticated"
                    });
                }

                using var connection = new MySqlConnection(_database.cs);
                connection.Open();
                Console.WriteLine("Database connection opened");
                
                var insertSql = @"
                    INSERT INTO donations (item_name, quantity, category, pickup_start, pickup_end, 
                                        safe_until, address, notes, donor_id, status)
                    VALUES (@item_name, @quantity, @category, @pickup_start, @pickup_end, 
                            @safe_until, @address, @notes, @donor_id, 'open')";
                
                using var insertCmd = new MySqlCommand(insertSql, connection);
                insertCmd.Parameters.AddWithValue("@item_name", request.ItemName);
                insertCmd.Parameters.AddWithValue("@quantity", request.Quantity);
                insertCmd.Parameters.AddWithValue("@category", request.Category);
                insertCmd.Parameters.AddWithValue("@pickup_start", request.PickupStart);
                insertCmd.Parameters.AddWithValue("@pickup_end", request.PickupEnd);
                insertCmd.Parameters.AddWithValue("@safe_until", request.SafeUntil);
                insertCmd.Parameters.AddWithValue("@address", request.Address);
                insertCmd.Parameters.AddWithValue("@notes", request.Notes ?? "");
                insertCmd.Parameters.AddWithValue("@donor_id", currentUser.Id);
                
                Console.WriteLine("Executing insert command...");
                await insertCmd.ExecuteNonQueryAsync();
                Console.WriteLine("Insert completed");
                
                var donationId = (int)insertCmd.LastInsertedId;
                Console.WriteLine($"Donation ID: {donationId}");
                
                // Return success response
                return Ok(new DonationResponse
                {
                    Success = true,
                    Message = "Donation created successfully",
                    Donation = new Donation
                    {
                        Id = donationId,
                        ItemName = request.ItemName,
                        Quantity = request.Quantity,
                        Category = request.Category,
                        PickupStart = request.PickupStart,
                        PickupEnd = request.PickupEnd,
                        SafeUntil = request.SafeUntil,
                        Address = request.Address,
                        Notes = request.Notes,
                        DonorId = currentUser.Id,
                        Status = "open",
                        CreatedAt = DateTime.UtcNow
                    }
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error creating donation: {ex.Message}");
                return StatusCode(500, new DonationResponse
                {
                    Success = false,
                    Message = "An error occurred while creating the donation"
                });
            }
        }

        [HttpGet]
        public async Task<ActionResult<object>> GetDonations()
        {
            try
            {
                using var connection = new MySqlConnection(_database.cs);
                connection.Open();
                
                var getDonationsSql = @"
                    SELECT *
                    FROM donations
                    WHERE status IN ('open', 'claimed')
                    ORDER BY created_at DESC";
                
                using var getDonationsCmd = new MySqlCommand(getDonationsSql, connection);
                using var reader = await getDonationsCmd.ExecuteReaderAsync();
                
                var donations = new List<object>();
                while (await reader.ReadAsync())
                {
                    donations.Add(new
                    {
                        Id = reader.GetInt32(0),
                        ItemName = reader.GetString(1),
                        Quantity = reader.GetString(2),
                        Category = reader.GetString(3),
                        PickupStart = reader.GetDateTime(4),
                        PickupEnd = reader.GetDateTime(5),
                        SafeUntil = reader.GetDateTime(6),
                        Address = reader.GetString(7),
                        Notes = reader.IsDBNull(8) ? null : reader.GetString(8),
                        DonorId = reader.GetInt32(9),
                        Status = reader.GetString(10),
                        ClaimedByNonprofitId = reader.IsDBNull(11) ? (int?)null : reader.GetInt32(11),
                        AssignedDriverId = reader.IsDBNull(12) ? (int?)null : reader.GetInt32(12),
                        CreatedAt = reader.GetDateTime(13),
                        UpdatedAt = reader.IsDBNull(14) ? (DateTime?)null : reader.GetDateTime(14)
                    });
                }
                
                return Ok(new { donations });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error getting donations: {ex.Message}");
                return StatusCode(500, new { error = "An error occurred while fetching donations" });
            }
        }

        [HttpPost("{id}/claim")]
        public async Task<ActionResult<DonationResponse>> ClaimDonation(int id)
        {
            try
            {
                var currentUser = GetCurrentUser();
                if (currentUser == null || currentUser.Role != UserRole.Nonprofit)
                {
                    return Unauthorized(new DonationResponse
                    {
                        Success = false,
                        Message = "Only nonprofits can claim donations"
                    });
                }

                using var connection = new MySqlConnection(_database.cs);
                connection.Open();
                
                // Check if donation exists and is available
                var checkSql = "SELECT status FROM donations WHERE id = @id";
                using var checkCmd = new MySqlCommand(checkSql, connection);
                checkCmd.Parameters.AddWithValue("@id", id);
                
                var status = await checkCmd.ExecuteScalarAsync() as string;
                if (status == null)
                {
                    return NotFound(new DonationResponse
                    {
                        Success = false,
                        Message = "Donation not found"
                    });
                }
                
                if (status != "open")
                {
                    return BadRequest(new DonationResponse
                    {
                        Success = false,
                        Message = "Donation is no longer available"
                    });
                }
                
                // Claim the donation
                var claimSql = @"
                    UPDATE donations 
                    SET status = 'claimed', 
                        claimed_by_nonprofit_id = @nonprofit_id,
                        updated_at = CURRENT_TIMESTAMP
                    WHERE id = @id";
                
                using var claimCmd = new MySqlCommand(claimSql, connection);
                claimCmd.Parameters.AddWithValue("@id", id);
                claimCmd.Parameters.AddWithValue("@nonprofit_id", currentUser.Id);
                
                var rowsAffected = await claimCmd.ExecuteNonQueryAsync();
                
                if (rowsAffected > 0)
                {
                    return Ok(new DonationResponse
                    {
                        Success = true,
                        Message = "Donation claimed successfully"
                    });
                }
                else
                {
                    return BadRequest(new DonationResponse
                    {
                        Success = false,
                        Message = "Failed to claim donation"
                    });
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error claiming donation: {ex.Message}");
                return StatusCode(500, new DonationResponse
                {
                    Success = false,
                    Message = "An error occurred while claiming the donation"
                });
            }
        }

        [HttpPost("test")]
        public async Task<ActionResult<object>> TestCreateDonation()
        {
            try
            {
                Console.WriteLine("Test donation creation started");
                
                using var connection = new MySqlConnection(_database.cs);
                connection.Open();
                Console.WriteLine("Database connection opened");
                
                var insertSql = @"
                    INSERT INTO donations (item_name, quantity, category, pickup_start, pickup_end, 
                                        safe_until, address, notes, donor_id, status)
                    VALUES ('Test Item', '1 item', 'Other', '2024-01-15 14:00:00', '2024-01-15 18:00:00', 
                            '2024-01-15 20:00:00', 'Test Address', '', 2, 'open')";
                
                using var insertCmd = new MySqlCommand(insertSql, connection);
                Console.WriteLine("Executing insert command...");
                await insertCmd.ExecuteNonQueryAsync();
                Console.WriteLine("Insert completed");
                
                var donationId = (int)insertCmd.LastInsertedId;
                Console.WriteLine($"Donation ID: {donationId}");
                
                return Ok(new { 
                    success = true, 
                    message = "Test donation created successfully",
                    donationId = donationId
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Test donation error: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                return StatusCode(500, new { 
                    success = false, 
                    error = ex.Message,
                    stackTrace = ex.StackTrace
                });
            }
        }

        [HttpGet("test")]
        public ActionResult<object> TestEndpoint()
        {
            try
            {
                using var connection = new MySqlConnection(_database.cs);
                connection.Open();
                
                var testSql = "SELECT COUNT(*) FROM donations";
                using var testCmd = new MySqlCommand(testSql, connection);
                var count = testCmd.ExecuteScalar();
                
                // Also get all donations to see what's there
                var getAllSql = "SELECT id, item_name, status FROM donations";
                using var getAllCmd = new MySqlCommand(getAllSql, connection);
                using var reader = getAllCmd.ExecuteReader();
                
                var donations = new List<object>();
                while (reader.Read())
                {
                    donations.Add(new
                    {
                        Id = reader.GetInt32(0),
                        ItemName = reader.GetString(1),
                        Status = reader.GetString(2)
                    });
                }
                
                return Ok(new { 
                    success = true, 
                    message = "Database connection working",
                    donationCount = count,
                    donations = donations
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { 
                    success = false, 
                    error = ex.Message,
                    stackTrace = ex.StackTrace
                });
            }
        }

        [HttpGet("debug/schema")]
        public ActionResult<object> GetDonationsSchema()
        {
            try
            {
                using var connection = new MySqlConnection(_database.cs);
                connection.Open();
                
                var describeTableSql = "DESCRIBE donations";
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

        private User? GetCurrentUser()
        {
            // For now, return a mock donor user
            // In a real app, you'd get this from JWT token or session
            return new User
            {
                Id = 2, // Using existing donor user from database
                Email = "test@donor.com",
                FirstName = "Test",
                LastName = "Donor",
                Role = UserRole.Donor
            };
        }
    }
}
