// See https://aka.ms/new-console-template for more information
using FoodFlow.Database;

Console.WriteLine("Testing FoodFlow API Database Connection...");

// Test database connection
bool isConnected = await DatabaseConnection.TestConnectionAsync();

if (isConnected)
{
    Console.WriteLine("✅ Database connection successful!");
    Console.WriteLine("FoodFlow API is ready to run.");
}
else
{
    Console.WriteLine("❌ Database connection failed!");
    Console.WriteLine("Please check your connection string and database settings.");
}

Console.WriteLine("\nDatabase connection test completed.");
