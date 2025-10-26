using FoodFlow.Models;
using FoodFlow.Database;
using MySql.Data.MySqlClient;
using System.Text.Json;

namespace FoodFlow.Services
{
    public class UserService
    {
        private readonly Database.Database _database;
        
        public UserService()
        {
            _database = new Database.Database();
            InitializeDatabaseAsync().Wait();
        }
        
        private async Task InitializeDatabaseAsync()
        {
            try
            {
                using var connection = new MySqlConnection(_database.cs);
                await connection.OpenAsync();
                
                // Create users table
                var createTableQuery = @"
                    CREATE TABLE IF NOT EXISTS users (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        email VARCHAR(255) UNIQUE NOT NULL,
                        password_hash VARCHAR(255) NOT NULL,
                        first_name VARCHAR(100) NOT NULL,
                        last_name VARCHAR(100) NOT NULL,
                        role INT NOT NULL,
                        business_name VARCHAR(255) NULL,
                        business_type VARCHAR(100) NULL,
                        organization_name VARCHAR(255) NULL,
                        organization_type VARCHAR(100) NULL,
                        created_at DATETIME NOT NULL,
                        last_login_at DATETIME NULL,
                        INDEX idx_email (email),
                        INDEX idx_role (role)
                    )";
                
                using var command = new MySqlCommand(createTableQuery, connection);
                await command.ExecuteNonQueryAsync();
                
                // Insert admin user if not exists
                var adminQuery = @"
                    INSERT IGNORE INTO users (email, password_hash, first_name, last_name, role, created_at) 
                    VALUES ('admin@food.com', 'ooT5kMi7ejkXZePlhOgJ9HK4pNTtzPdKqmp/eGEkgso=:NZiI8wTJlfEWhV0Wex9YV0OWmWpDC66zdmp14o+Uv58=', 'Admin', 'User', 4, NOW())";
                
                using var adminCommand = new MySqlCommand(adminQuery, connection);
                await adminCommand.ExecuteNonQueryAsync();
                
                Console.WriteLine("Database initialized successfully");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error initializing database: {ex.Message}");
            }
        }
        
        public async Task<User?> GetUserByEmailAsync(string email)
        {
            try
            {
                using var connection = new MySqlConnection(_database.cs);
                await connection.OpenAsync();
                
                var query = "SELECT * FROM users WHERE email = @email";
                using var command = new MySqlCommand(query, connection);
                command.Parameters.AddWithValue("@email", email.ToLower());
                
                using var reader = await command.ExecuteReaderAsync();
                if (await reader.ReadAsync())
                {
                    return new User
                    {
                        Id = reader.GetInt32(0),
                        Email = reader.GetString(1),
                        PasswordHash = reader.GetString(2),
                        FirstName = reader.GetString(3),
                        LastName = reader.GetString(4),
                        Role = (UserRole)reader.GetInt32(5),
                        BusinessName = reader.IsDBNull(6) ? null : reader.GetString(6),
                        BusinessType = reader.IsDBNull(7) ? null : reader.GetString(7),
                        OrganizationName = reader.IsDBNull(8) ? null : reader.GetString(8),
                        OrganizationType = reader.IsDBNull(9) ? null : reader.GetString(9),
                        CreatedAt = reader.GetDateTime(10),
                        LastLoginAt = reader.IsDBNull(11) ? null : reader.GetDateTime(11)
                    };
                }
                
                return null;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error getting user by email: {ex.Message}");
                return null;
            }
        }
        
        public async Task<bool> CreateUserAsync(User user)
        {
            try
            {
                using var connection = new MySqlConnection(_database.cs);
                await connection.OpenAsync();
                
                var query = @"INSERT INTO users (email, password_hash, first_name, last_name, role, 
                              business_name, business_type, organization_name, organization_type, created_at) 
                              VALUES (@email, @passwordHash, @firstName, @lastName, @role, 
                              @businessName, @businessType, @organizationName, @organizationType, @createdAt)";
                
                using var command = new MySqlCommand(query, connection);
                command.Parameters.AddWithValue("@email", user.Email.ToLower());
                command.Parameters.AddWithValue("@passwordHash", user.PasswordHash);
                command.Parameters.AddWithValue("@firstName", user.FirstName);
                command.Parameters.AddWithValue("@lastName", user.LastName);
                command.Parameters.AddWithValue("@role", (int)user.Role);
                command.Parameters.AddWithValue("@businessName", user.BusinessName ?? (object)DBNull.Value);
                command.Parameters.AddWithValue("@businessType", user.BusinessType ?? (object)DBNull.Value);
                command.Parameters.AddWithValue("@organizationName", user.OrganizationName ?? (object)DBNull.Value);
                command.Parameters.AddWithValue("@organizationType", user.OrganizationType ?? (object)DBNull.Value);
                command.Parameters.AddWithValue("@createdAt", user.CreatedAt);
                
                var result = await command.ExecuteNonQueryAsync();
                return result > 0;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error creating user: {ex.Message}");
                return false;
            }
        }
        
        public async Task<bool> UpdateLastLoginAsync(string email)
        {
            try
            {
                using var connection = new MySqlConnection(_database.cs);
                await connection.OpenAsync();
                
                var query = "UPDATE users SET last_login_at = @lastLoginAt WHERE email = @email";
                using var command = new MySqlCommand(query, connection);
                command.Parameters.AddWithValue("@lastLoginAt", DateTime.UtcNow);
                command.Parameters.AddWithValue("@email", email.ToLower());
                
                var result = await command.ExecuteNonQueryAsync();
                return result > 0;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error updating last login: {ex.Message}");
                return false;
            }
        }
        
        public async Task<bool> UserExistsAsync(string email)
        {
            try
            {
                using var connection = new MySqlConnection(_database.cs);
                await connection.OpenAsync();
                
                var query = "SELECT COUNT(*) FROM users WHERE email = @email";
                using var command = new MySqlCommand(query, connection);
                command.Parameters.AddWithValue("@email", email.ToLower());
                
                var count = Convert.ToInt32(await command.ExecuteScalarAsync());
                return count > 0;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error checking if user exists: {ex.Message}");
                return false;
            }
        }
    }
}
