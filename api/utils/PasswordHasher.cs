using System.Security.Cryptography;
using System.Text;

namespace FoodFlow.Utils
{
    public static class PasswordHasher
    {
        public static string HashPassword(string password)
        {
            using var sha256 = SHA256.Create();
            var salt = GenerateSalt();
            var saltedPassword = password + salt;
            var hashedBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(saltedPassword));
            return Convert.ToBase64String(hashedBytes) + ":" + salt;
        }
        
        public static bool VerifyPassword(string password, string hash)
        {
            var parts = hash.Split(':');
            if (parts.Length != 2) return false;
            
            var storedHash = parts[0];
            var salt = parts[1];
            
            using var sha256 = SHA256.Create();
            var saltedPassword = password + salt;
            var hashedBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(saltedPassword));
            var computedHash = Convert.ToBase64String(hashedBytes);
            
            return storedHash == computedHash;
        }
        
        private static string GenerateSalt()
        {
            var saltBytes = new byte[32];
            using var rng = RandomNumberGenerator.Create();
            rng.GetBytes(saltBytes);
            return Convert.ToBase64String(saltBytes);
        }
    }
}
