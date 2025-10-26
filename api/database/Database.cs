using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace FoodFlow.Database
{
    public class Database
    {
        // Database connection and operations will be implemented here
        public string host {get; set;}
        public string database {get; set;}
        public string username {get; set;}
        public string port {get; set;}
        public string password {get; set;}
        public string cs {get; set;}
        public Database()
        {
            // Initialize database connection
            this.host = "rtzsaka6vivj2zp1.cbetxkdyhwsb.us-east-1.rds.amazonaws.com";
            this.database = "jpg1ldoebfgn7c2o";
            this.username = "yi0mxxnb7yvqlr7z";
            this.port = "3306";
            this.password = "ghqbrniyhwe2lfwd";
            this.cs = "Server=rtzsaka6vivj2zp1.cbetxkdyhwsb.us-east-1.rds.amazonaws.com;Port=3306;Database=jpg1ldoebfgn7c2o;Uid=yi0mxxnb7yvqlr7z;Pwd=ghqbrniyhwe2lfwd;SslMode=Required;";
        }
    }
}
