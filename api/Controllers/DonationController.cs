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
            try
            {
                _database = new Database.Database();
                InitializeDatabase();
                Console.WriteLine("DonationController initialized successfully");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error initializing DonationController: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                throw; // Re-throw to see the error
            }
        }

        private void InitializeDatabase()
        {
            try
            {
                // Just verify database connection - don't recreate tables
                using var connection = new MySqlConnection(_database.cs);
                connection.Open();
                Console.WriteLine("DonationController database connection verified");
                
                // Add missing columns to donations table
                AddMissingDonationColumns(connection);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error connecting to database: {ex.Message}");
                throw;
            }
        }

        private void AddMissingDonationColumns(MySqlConnection connection)
        {
            try
            {
                var columnsToAdd = new[]
                {
                    ("claimed_by_nonprofit_id", "INT NULL"),
                    ("updated_at", "DATETIME NULL"),
                    ("assigned_driver_id", "INT NULL"),
                    ("assigned_at", "DATETIME NULL")
                };
                
                foreach (var (columnName, columnType) in columnsToAdd)
                {
                    try
                    {
                        // Check if column exists first
                        var checkQuery = $"SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'donations' AND COLUMN_NAME = '{columnName}'";
                        using var checkCommand = new MySqlCommand(checkQuery, connection);
                        var exists = Convert.ToInt32(checkCommand.ExecuteScalar()) > 0;
                        
                        if (!exists)
                        {
                            var addQuery = $"ALTER TABLE donations ADD COLUMN {columnName} {columnType}";
                            using var addCommand = new MySqlCommand(addQuery, connection);
                            addCommand.ExecuteNonQuery();
                            Console.WriteLine($"Added column to donations table: {columnName}");
                        }
                        else
                        {
                            Console.WriteLine($"Column {columnName} already exists in donations table");
                        }
                    }
                    catch (MySqlException ex) when (ex.Number == 1060) // Duplicate column name
                    {
                        Console.WriteLine($"Column {columnName} may already exist: {ex.Message}");
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error adding missing donation columns: {ex.Message}");
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

        [HttpGet("ping")]
        public ActionResult<string> Ping()
        {
            return Ok("DonationController is working!");
        }

        [HttpGet("test-simple")]
        public ActionResult<object> TestSimple()
        {
            return Ok(new { message = "DonationController is working!", timestamp = DateTime.UtcNow });
        }

        [HttpGet]
        public async Task<ActionResult<object>> GetDonations()
        {
            try
            {
                using var connection = new MySqlConnection(_database.cs);
                connection.Open();
                
                var getDonationsSql = @"
                    SELECT d.id, d.item_name, d.quantity, d.category, d.pickup_start, d.pickup_end, 
                           d.safe_until, d.address, d.notes, d.donor_id, d.status, d.created_at,
                           u.first_name, u.last_name, u.business_name, u.organization_name
                    FROM donations d
                    LEFT JOIN users u ON d.donor_id = u.id
                    WHERE d.status = 'open'
                    ORDER BY d.created_at DESC";
                
                using var getDonationsCmd = new MySqlCommand(getDonationsSql, connection);
                using var reader = await getDonationsCmd.ExecuteReaderAsync();
                
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
                return StatusCode(500, new { error = "An error occurred while fetching donations" });
            }
        }

        [HttpGet("claimed")]
        public async Task<ActionResult<object>> GetClaimedDonations()
        {
            try
            {
                var currentUser = GetCurrentUser();
                if (currentUser == null || currentUser.Role != UserRole.Nonprofit)
                {
                    return Unauthorized(new { error = "Only nonprofits can view claimed donations" });
                }

                using var connection = new MySqlConnection(_database.cs);
                connection.Open();
                
                var getClaimedSql = @"
                    SELECT d.id, d.item_name, d.quantity, d.category, d.pickup_start, d.pickup_end, 
                           d.safe_until, d.address, d.notes, d.donor_id, d.status, d.created_at,
                           u.first_name, u.last_name, u.business_name, u.organization_name
                    FROM donations d
                    LEFT JOIN users u ON d.donor_id = u.id
                    WHERE d.claimed_by_nonprofit_id = @nonprofit_id
                    ORDER BY d.created_at DESC";
                
                using var getClaimedCmd = new MySqlCommand(getClaimedSql, connection);
                getClaimedCmd.Parameters.AddWithValue("@nonprofit_id", currentUser.Id);
                using var reader = await getClaimedCmd.ExecuteReaderAsync();
                
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
                Console.WriteLine($"Error getting claimed donations: {ex.Message}");
                return StatusCode(500, new { error = "An error occurred while fetching claimed donations" });
            }
        }

        [HttpPost("{id}/claim")]
        public async Task<ActionResult<DonationResponse>> ClaimDonation(int id, [FromBody] ClaimDonationRequest? request)
        {
            try
            {
                if (request == null || request.UserId == 0)
                {
                    return Unauthorized(new DonationResponse
                    {
                        Success = false,
                        Message = "User ID is required"
                    });
                }
                
                var currentUser = await GetUserById(request.UserId);
                if (currentUser == null)
                {
                    return Unauthorized(new DonationResponse
                    {
                        Success = false,
                        Message = "User not found"
                    });
                }
                
                if (currentUser.Role != UserRole.Nonprofit)
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

        [HttpGet("claimed-for-drivers")]
        public async Task<ActionResult<object>> GetClaimedDonationsForDrivers()
        {
            try
            {
                var currentUser = GetCurrentUser();
                if (currentUser == null || currentUser.Role != UserRole.Driver)
                {
                    return Unauthorized(new { error = "Only drivers can view claimed donations for pickup" });
                }

                using var connection = new MySqlConnection(_database.cs);
                connection.Open();
                
                var getClaimedSql = @"
                    SELECT d.id, d.item_name, d.quantity, d.category, d.pickup_start, d.pickup_end, 
                           d.safe_until, d.address, d.notes, d.donor_id, d.status, d.created_at,
                           u.first_name, u.last_name, u.business_name, u.organization_name,
                           np.first_name as np_first_name, np.last_name as np_last_name, 
                           np.organization_name as np_organization_name
                    FROM donations d
                    LEFT JOIN users u ON d.donor_id = u.id
                    LEFT JOIN users np ON d.claimed_by_nonprofit_id = np.id
                    WHERE d.status = 'claimed' AND d.claimed_by_nonprofit_id IS NOT NULL
                    ORDER BY d.created_at DESC";
                
                using var getClaimedCmd = new MySqlCommand(getClaimedSql, connection);
                using var reader = await getClaimedCmd.ExecuteReaderAsync();
                
                var donations = new List<object>();
                while (await reader.ReadAsync())
                {
                    var idIndex = reader.GetOrdinal("id");
                    var itemNameIndex = reader.GetOrdinal("item_name");
                    var quantityIndex = reader.GetOrdinal("quantity");
                    var categoryIndex = reader.GetOrdinal("category");
                    var pickupStartIndex = reader.GetOrdinal("pickup_start");
                    var pickupEndIndex = reader.GetOrdinal("pickup_end");
                    var safeUntilIndex = reader.GetOrdinal("safe_until");
                    var addressIndex = reader.GetOrdinal("address");
                    var notesIndex = reader.GetOrdinal("notes");
                    var donorIdIndex = reader.GetOrdinal("donor_id");
                    var statusIndex = reader.GetOrdinal("status");
                    var createdAtIndex = reader.GetOrdinal("created_at");
                    var donorFirstNameIndex = reader.GetOrdinal("first_name");
                    var donorLastNameIndex = reader.GetOrdinal("last_name");
                    var donorBusinessNameIndex = reader.GetOrdinal("business_name");
                    var donorOrganizationNameIndex = reader.GetOrdinal("organization_name");
                    var npFirstNameIndex = reader.GetOrdinal("np_first_name");
                    var npLastNameIndex = reader.GetOrdinal("np_last_name");
                    var npOrganizationNameIndex = reader.GetOrdinal("np_organization_name");

                    donations.Add(new
                    {
                        id = reader.GetInt32(idIndex),
                        itemName = reader.GetString(itemNameIndex),
                        quantity = reader.GetString(quantityIndex),
                        category = reader.GetString(categoryIndex),
                        pickupStart = reader.GetDateTime(pickupStartIndex),
                        pickupEnd = reader.GetDateTime(pickupEndIndex),
                        safeUntil = reader.GetDateTime(safeUntilIndex),
                        address = reader.GetString(addressIndex),
                        notes = reader.IsDBNull(notesIndex) ? "" : reader.GetString(notesIndex),
                        donorId = reader.GetInt32(donorIdIndex),
                        status = reader.GetString(statusIndex),
                        createdAt = reader.GetDateTime(createdAtIndex),
                        donor = new
                        {
                            firstName = reader.IsDBNull(donorFirstNameIndex) ? "" : reader.GetString(donorFirstNameIndex),
                            lastName = reader.IsDBNull(donorLastNameIndex) ? "" : reader.GetString(donorLastNameIndex),
                            businessName = reader.IsDBNull(donorBusinessNameIndex) ? null : reader.GetString(donorBusinessNameIndex),
                            organizationName = reader.IsDBNull(donorOrganizationNameIndex) ? null : reader.GetString(donorOrganizationNameIndex)
                        },
                        nonprofit = new
                        {
                            firstName = reader.IsDBNull(npFirstNameIndex) ? "" : reader.GetString(npFirstNameIndex),
                            lastName = reader.IsDBNull(npLastNameIndex) ? "" : reader.GetString(npLastNameIndex),
                            organizationName = reader.IsDBNull(npOrganizationNameIndex) ? null : reader.GetString(npOrganizationNameIndex)
                        }
                    });
                }
                
                return Ok(new { donations });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error loading claimed donations for drivers: {ex.Message}");
                return StatusCode(500, new { error = "An error occurred while loading claimed donations" });
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<object>> GetDonation(int id)
        {
            try
            {
                using var connection = new MySqlConnection(_database.cs);
                connection.Open();
                
                var getDonationSql = @"
                    SELECT d.id, d.item_name, d.quantity, d.category, d.pickup_start, d.pickup_end, 
                           d.safe_until, d.address, d.notes, d.donor_id, d.status, d.created_at,
                           d.assigned_driver_id,
                           u.first_name, u.last_name, u.business_name, u.organization_name
                    FROM donations d
                    LEFT JOIN users u ON d.donor_id = u.id
                    WHERE d.id = @donationId";
                
                using var getDonationCmd = new MySqlCommand(getDonationSql, connection);
                getDonationCmd.Parameters.AddWithValue("@donationId", id);
                using var reader = await getDonationCmd.ExecuteReaderAsync();
                
                if (await reader.ReadAsync())
                {
                    var donation = new
                    {
                        id = reader.GetInt32(0),
                        itemName = reader.GetString(1),
                        quantity = reader.GetString(2),
                        category = reader.GetString(3),
                        pickupStart = reader.GetDateTime(4),
                        pickupEnd = reader.GetDateTime(5),
                        safeUntil = reader.GetDateTime(6),
                        address = reader.GetString(7),
                        notes = reader.IsDBNull(8) ? "" : reader.GetString(8),
                        donorId = reader.GetInt32(9),
                        status = reader.GetString(10),
                        createdAt = reader.GetDateTime(11),
                        assignedDriverId = reader.IsDBNull(12) ? (int?)null : reader.GetInt32(12),
                        donor = new
                        {
                            firstName = reader.IsDBNull(13) ? "" : reader.GetString(13),
                            lastName = reader.IsDBNull(14) ? "" : reader.GetString(14),
                            businessName = reader.IsDBNull(15) ? null : reader.GetString(15),
                            organizationName = reader.IsDBNull(16) ? null : reader.GetString(16)
                        }
                    };
                    
                    return Ok(donation);
                }
                else
                {
                    return NotFound(new { error = "Donation not found" });
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error loading donation: {ex.Message}");
                return StatusCode(500, new { error = "An error occurred while loading the donation" });
            }
        }

        [HttpPost("{id}/assign-driver")]
        public async Task<ActionResult<object>> AssignDriver(int id, [FromBody] AssignDriverRequest request)
        {
            try
            {
                if (request == null || request.DriverId == 0)
                {
                    return BadRequest(new { 
                        success = false,
                        message = "Driver ID is required"
                    });
                }
                
                using var connection = new MySqlConnection(_database.cs);
                connection.Open();
                
                // Check if donation exists and is claimed by a nonprofit
                var checkSql = @"
                    SELECT d.id, d.status, d.claimed_by_nonprofit_id, u.email as nonprofit_email
                    FROM donations d
                    LEFT JOIN users u ON d.claimed_by_nonprofit_id = u.id
                    WHERE d.id = @donationId";
                
                using var checkCmd = new MySqlCommand(checkSql, connection);
                checkCmd.Parameters.AddWithValue("@donationId", id);
                
                using var reader = await checkCmd.ExecuteReaderAsync();
                if (!reader.Read())
                {
                    return NotFound(new { 
                        success = false,
                        message = "Donation not found"
                    });
                }
                
                var statusIndex = reader.GetOrdinal("status");
                var claimedByNonprofitIdIndex = reader.GetOrdinal("claimed_by_nonprofit_id");
                var nonprofitEmailIndex = reader.GetOrdinal("nonprofit_email");
                
                var status = reader.GetString(statusIndex);
                var claimedByNonprofitId = reader.IsDBNull(claimedByNonprofitIdIndex) ? (int?)null : reader.GetInt32(claimedByNonprofitIdIndex);
                var nonprofitEmail = reader.IsDBNull(nonprofitEmailIndex) ? null : reader.GetString(nonprofitEmailIndex);
                
                reader.Close();
                
                if (status != "claimed")
                {
                    return BadRequest(new { 
                        success = false,
                        message = "Donation must be claimed by a nonprofit before assigning to driver"
                    });
                }
                
                if (!claimedByNonprofitId.HasValue)
                {
                    return BadRequest(new { 
                        success = false,
                        message = "Donation is not claimed by any nonprofit"
                    });
                }
                
                // Update donation with driver assignment
                var updateSql = @"
                    UPDATE donations 
                    SET assigned_driver_id = @driverId, 
                        status = 'assigned',
                        assigned_at = NOW()
                    WHERE id = @donationId";
                
                using var updateCmd = new MySqlCommand(updateSql, connection);
                updateCmd.Parameters.AddWithValue("@driverId", request.DriverId);
                updateCmd.Parameters.AddWithValue("@donationId", id);
                
                int rowsAffected = await updateCmd.ExecuteNonQueryAsync();
                
                if (rowsAffected > 0)
                {
                    return Ok(new { 
                        success = true,
                        message = "Driver assigned successfully",
                        nonprofitEmail = nonprofitEmail
                    });
                }
                else
                {
                    return BadRequest(new { 
                        success = false,
                        message = "Failed to assign driver"
                    });
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error assigning driver: {ex.Message}");
                return StatusCode(500, new { 
                    success = false,
                    message = "An error occurred while assigning the driver"
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

        [HttpPost("{id}/complete-delivery")]
        public async Task<ActionResult<object>> CompleteDelivery(int id)
        {
            try
            {
                var currentUser = GetCurrentUser();
                if (currentUser == null || currentUser.Role != UserRole.Driver)
                {
                    return Unauthorized(new { 
                        success = false,
                        message = "Only drivers can complete deliveries"
                    });
                }

                using var connection = new MySqlConnection(_database.cs);
                connection.Open();
                
                var checkSql = @"
                    SELECT d.id, d.status, d.assigned_driver_id
                    FROM donations d
                    WHERE d.id = @donationId";
                
                using var checkCmd = new MySqlCommand(checkSql, connection);
                checkCmd.Parameters.AddWithValue("@donationId", id);
                
                using var reader = await checkCmd.ExecuteReaderAsync();
                if (!reader.Read())
                {
                    return NotFound(new { 
                        success = false,
                        message = "Donation not found"
                    });
                }
                
                var statusIndex = reader.GetOrdinal("status");
                var assignedDriverIdIndex = reader.GetOrdinal("assigned_driver_id");
                
                var status = reader.GetString(statusIndex);
                var assignedDriverId = reader.IsDBNull(assignedDriverIdIndex) ? (int?)null : reader.GetInt32(assignedDriverIdIndex);
                
                reader.Close();
                
                if (status != "assigned" && (!assignedDriverId.HasValue || assignedDriverId.Value != currentUser.Id))
                {
                    return BadRequest(new { 
                        success = false,
                        message = "Donation must be assigned to a driver before completing delivery"
                    });
                }
                
                if (!assignedDriverId.HasValue || assignedDriverId.Value != currentUser.Id)
                {
                    return BadRequest(new { 
                        success = false,
                        message = "This donation is not assigned to you"
                    });
                }
                
                var updateSql = @"
                    UPDATE donations 
                    SET status = 'delivered',
                        updated_at = NOW()
                    WHERE id = @donationId";
                
                using var updateCmd = new MySqlCommand(updateSql, connection);
                updateCmd.Parameters.AddWithValue("@donationId", id);
                
                int rowsAffected = await updateCmd.ExecuteNonQueryAsync();
                
                if (rowsAffected > 0)
                {
                    return Ok(new { 
                        success = true,
                        message = "Delivery completed successfully"
                    });
                }
                else
                {
                    return BadRequest(new { 
                        success = false,
                        message = "Failed to complete delivery"
                    });
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error completing delivery: {ex.Message}");
                return StatusCode(500, new { 
                    success = false,
                    message = "An error occurred while completing the delivery"
                });
            }
        }
        
        private User? GetCurrentUser()
        {
            // For now, return a mock nonprofit user for testing
            // In a real app, you'd get this from JWT token or session
            return new User
            {
                Id = 7, // Using existing nonprofit user from database
                Email = "johndoenonprofit@gmail.com",
                FirstName = "John",
                LastName = "Doe",
                Role = UserRole.Nonprofit
            };
        }
        
        private async Task<User?> GetUserById(int userId)
        {
            try
            {
                using var connection = new MySqlConnection(_database.cs);
                connection.Open();
                
                var sql = @"
                    SELECT id, email, password_hash, first_name, last_name, role, 
                           account_status, email_verified, created_at, last_login
                    FROM users 
                    WHERE id = @id";
                
                using var cmd = new MySqlCommand(sql, connection);
                cmd.Parameters.AddWithValue("@id", userId);
                
                using var reader = await cmd.ExecuteReaderAsync();
                if (!await reader.ReadAsync())
                {
                    return null;
                }
                
                var roleString = reader.GetString(5);
                var role = roleString switch
                {
                    "donor" => UserRole.Donor,
                    "nonprofit" => UserRole.Nonprofit,
                    "driver" => UserRole.Driver,
                    "admin" => UserRole.Admin,
                    _ => UserRole.Donor
                };
                
                return new User
                {
                    Id = reader.GetInt32(0),
                    Email = reader.GetString(1),
                    PasswordHash = reader.GetString(2),
                    FirstName = reader.GetString(3),
                    LastName = reader.GetString(4),
                    Role = role,
                    CreatedAt = reader.GetDateTime(8)
                };
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error getting user by ID: {ex.Message}");
                return null;
            }
        }
    }
    
    public class ClaimDonationRequest
    {
        public int UserId { get; set; }
    }

    public class AssignDriverRequest
    {
        public int DriverId { get; set; }
    }
}
