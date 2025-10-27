-- Create users table for FoodFlow application
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role INT NOT NULL, -- 1=Donor, 2=Nonprofit, 3=Driver, 4=Admin
    business_name VARCHAR(255) NULL,
    business_type VARCHAR(100) NULL,
    organization_name VARCHAR(255) NULL,
    organization_type VARCHAR(100) NULL,
    address VARCHAR(255) NULL,
    city VARCHAR(100) NULL,
    state VARCHAR(50) NULL,
    zip_code VARCHAR(20) NULL,
    country VARCHAR(100) NULL,
    service_city VARCHAR(100) NULL,
    service_radius_miles INT NULL,
    preferred_areas TEXT NULL,
    is_available BOOLEAN DEFAULT TRUE,
    vehicle_type VARCHAR(50) NULL,
    license_plate VARCHAR(20) NULL,
    created_at DATETIME NOT NULL,
    last_login_at DATETIME NULL,
    INDEX idx_email (email),
    INDEX idx_role (role)
);

-- Insert admin user
INSERT IGNORE INTO users (email, password_hash, first_name, last_name, role, created_at) 
VALUES ('admin@food.com', '$2a$11$ooT5kMi7ejkXZePlhOgJ9HK4pNTtzPdKqmp/eGEkgso=:NZiI8wTJlfEWhV0Wex9YV0OWmWpDC66zdmp14o+Uv58=', 'Admin', 'User', 4, NOW());
