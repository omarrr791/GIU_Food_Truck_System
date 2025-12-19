-- Create suppliers table (for future use)
CREATE TABLE IF NOT EXISTS suppliers (
  supplier_id SERIAL PRIMARY KEY,
  supplier_name TEXT,
  contact_info TEXT,
  address TEXT
);

-- Insert sample data into suppliers table
INSERT INTO suppliers (supplier_name, contact_info, address) VALUES
('Tech Supplies Inc.', 'info@techsupplies.com', '123 Tech Street, Silicon Valley, CA'),
('Gadget World', 'support@gadgetworld.com', '456 Gadget Avenue, New York, NY'),
('Hardware Supplies Ltd.', 'contact@hardwaresupplies.com', '789 Hardware Blvd, Austin, TX');

-- Create categories table (for future use)
CREATE TABLE IF NOT EXISTS categories (
  category_id SERIAL PRIMARY KEY,
  category_name TEXT
);

-- Insert sample data into categories table
INSERT INTO categories (category_name) VALUES
('Electronics'),
('Tools'),
('Furniture');

-- Create equipments table (optional, for future use)
CREATE TABLE IF NOT EXISTS equipments (
  equipment_id SERIAL PRIMARY KEY,
  equipment_name TEXT,
  equipment_img BYTEA,
  rating INTEGER DEFAULT 5,
  model_number INTEGER,
  purchase_date DATE,
  quantity INTEGER,
  status TEXT,
  location TEXT,
  category_id INTEGER,
  FOREIGN KEY (category_id) REFERENCES categories (category_id),
  supplier_id INTEGER,
  FOREIGN KEY (supplier_id) REFERENCES suppliers (supplier_id)
);

-- Insert sample data into equipments table
INSERT INTO equipments (equipment_name, equipment_img, rating, model_number, purchase_date, quantity, status, location, category_id, supplier_id) VALUES
('Laptop', NULL, 4, 101, '2023-05-01', 50, 'Available', 'Storage 1A', 1, 1),
('Hammer', NULL, 5, 202, '2023-06-15', 200, 'Available', 'Storage 2B', 2, 2),
('Office Chair', NULL, 3, 303, '2023-07-10', 150, 'Available', 'Storage 3C', 3, 3);

-- Correct users table
CREATE TABLE IF NOT EXISTS users (
  user_id SERIAL PRIMARY KEY NOT NULL,
  username TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT CHECK (role IN ('superadmin', 'admin', 'user')),
  profile_image TEXT, -- Added for storing profile image paths
  created_at DATE DEFAULT CURRENT_TIMESTAMP,
  phone TEXT,
  national_id TEXT,
  address1 TEXT,
  address2 TEXT,
  city TEXT
);

-- Insert sample data into users table
INSERT INTO users (username, email, password, role, profile_image, phone, national_id, address1, address2, city) VALUES
('JohnDoe', 'john@example.com', 'password123', 'user', 'profile1.jpg', '555-1234', '1234567890', '123 Main St', 'Apt 4B', 'New York'),
('JaneSmith', 'jane@example.com', 'password456', 'admin', 'profile2.jpg', '555-5678', '0987654321', '456 Oak St', 'Suite 101', 'Los Angeles'),
('BobJohnson', 'bob@example.com', 'password789', 'superadmin', 'profile3.jpg', '555-8765', '1122334455', '789 Pine St', 'Unit 2C', 'Chicago');

-- Orders table
CREATE TABLE IF NOT EXISTS ordertable (
  order_id SERIAL PRIMARY KEY NOT NULL,
  user_id INTEGER,
  FOREIGN KEY (user_id) REFERENCES users (user_id),
  date1 DATE DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE products (
    id SERIAL PRIMARY KEY,          -- Auto-incrementing ID
    name VARCHAR(255) NOT NULL,      -- Name of the product
    description TEXT,                -- Description of the product
    price DECIMAL(10, 2) NOT NULL,   -- Price of the product (up to 10 digits, 2 decimals)
    quantity INT NOT NULL,          -- Quantity available
    image VARCHAR(255)              -- Image file path or URL (if storing image as a string)
);
-- Insert sample data into orders table
INSERT INTO ordertable (user_id, date1) VALUES
(1, '2023-10-01'),
(2, '2023-11-15'),
(3, '2023-12-01');

-- Cart table
CREATE TABLE IF NOT EXISTS cart (
  cart_id SERIAL PRIMARY KEY NOT NULL,
  user_id INTEGER,
  FOREIGN KEY (user_id) REFERENCES users (user_id),
  equipment_id INTEGER,
  FOREIGN KEY (equipment_id) REFERENCES equipments (equipment_id),
  quantity INTEGER NOT NULL
);

-- Insert sample data into cart table
INSERT INTO cart (user_id, equipment_id, quantity) VALUES
(1, 1, 2),
(2, 2, 5),
(3, 3, 1);

-- Ratings table
CREATE TABLE IF NOT EXISTS rating (
  rating_id SERIAL PRIMARY KEY NOT NULL UNIQUE,
  user_id INTEGER,
  FOREIGN KEY (user_id) REFERENCES users (user_id),
  equipment_id INTEGER,
  FOREIGN KEY (equipment_id) REFERENCES equipments (equipment_id),
  comment TEXT,
  score INTEGER CHECK (score BETWEEN 0 AND 5) NOT NULL
);

-- Insert sample data into rating table
INSERT INTO rating (user_id, equipment_id, comment, score) VALUES
(1, 1, 'Great laptop, very fast!', 5),
(2, 2, 'Very sturdy hammer, highly recommend.', 4),
(3, 3, 'The office chair is comfortable, but a bit expensive.', 3);

-- Equipment order table
CREATE TABLE IF NOT EXISTS equipmentorder (
  order_id SERIAL PRIMARY KEY NOT NULL UNIQUE,
  equipment_id INTEGER,
  FOREIGN KEY (equipment_id) REFERENCES equipments (equipment_id),
  quantity INTEGER
);

-- Insert sample data into equipmentorder table
INSERT INTO equipmentorder (equipment_id, quantity) VALUES
(1, 5),
(2, 10),
(3, 3);

-- Corrected SELECT query with JOINs instead of old-style comma joins
SELECT * 
FROM users
JOIN rating ON users.user_id = rating.user_id
JOIN equipments ON rating.equipment_id = equipments.equipment_id
JOIN ordertable ON users.user_id = ordertable.user_id
JOIN cart ON users.user_id = cart.user_id
JOIN equipmentorder ON equipments.equipment_id = equipmentorder.equipment_id
JOIN suppliers ON equipments.supplier_id = suppliers.supplier_id
JOIN categories ON equipments.category_id = categories.category_id;
