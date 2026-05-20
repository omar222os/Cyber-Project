CREATE DATABASE IF NOT EXISTS sqli_demo;
USE sqli_demo;

DROP TABLE IF EXISTS users;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    password VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL,
    email VARCHAR(100) NOT NULL,
    salary DECIMAL(10,2) NOT NULL
);

INSERT INTO users (username, password, role, email, salary) VALUES
('admin', 'admin123', 'admin', 'admin@test.com', 15000.00),
('john', 'john123', 'employee', 'john@test.com', 8000.00),
('sara', 'sara123', 'employee', 'sara@test.com', 9000.00),
('ahmed', 'secret456', 'manager', 'ahmed@test.com', 12000.00);
