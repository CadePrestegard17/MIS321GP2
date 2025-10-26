using MySql.Data.MySqlClient;
using System.Data;

namespace FoodFlow.Database
{
    public class DatabaseConnection
    {
        private static readonly string ConnectionString = "Server=rtzsaka6vivj2zp1.cbetxkdyhwsb.us-east-1.rds.amazonaws.com;" +
                                                         "Port=3306;" +
                                                         "Database=jpg1ldoebfgn7c2o;" +
                                                         "Uid=yi0mxxnb7yvqlr7z;" +
                                                         "Pwd=ghqbrniyhwe2lfwd;" +
                                                         "SslMode=Required;";

        public static MySqlConnection GetConnection()
        {
            return new MySqlConnection(ConnectionString);
        }

        public static async Task<bool> TestConnectionAsync()
        {
            try
            {
                using var connection = GetConnection();
                await connection.OpenAsync();
                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Database connection failed: {ex.Message}");
                return false;
            }
        }

        public static async Task<DataTable> ExecuteQueryAsync(string query, params MySqlParameter[] parameters)
        {
            var dataTable = new DataTable();
            
            try
            {
                using var connection = GetConnection();
                await connection.OpenAsync();
                
                using var command = new MySqlCommand(query, connection);
                if (parameters != null)
                {
                    command.Parameters.AddRange(parameters);
                }
                
                using var adapter = new MySqlDataAdapter(command);
                adapter.Fill(dataTable);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Query execution failed: {ex.Message}");
                throw;
            }
            
            return dataTable;
        }

        public static async Task<int> ExecuteNonQueryAsync(string query, params MySqlParameter[] parameters)
        {
            try
            {
                using var connection = GetConnection();
                await connection.OpenAsync();
                
                using var command = new MySqlCommand(query, connection);
                if (parameters != null)
                {
                    command.Parameters.AddRange(parameters);
                }
                
                return await command.ExecuteNonQueryAsync();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Non-query execution failed: {ex.Message}");
                throw;
            }
        }

        public static async Task<object?> ExecuteScalarAsync(string query, params MySqlParameter[] parameters)
        {
            try
            {
                using var connection = GetConnection();
                await connection.OpenAsync();
                
                using var command = new MySqlCommand(query, connection);
                if (parameters != null)
                {
                    command.Parameters.AddRange(parameters);
                }
                
                return await command.ExecuteScalarAsync();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Scalar execution failed: {ex.Message}");
                throw;
            }
        }
    }
}
