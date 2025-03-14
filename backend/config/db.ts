import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

const syncDatabase = async () => {
  try {
    const connection = await db.getConnection();

    console.log("Syncing database...");

    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(100) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        avatar VARCHAR(1000) DEFAULT "userDefault.png",
        role ENUM("admin", "user") NOT NULL DEFAULT "user",
        password VARCHAR(100) NOT NULL,
        refresh_token TEXT DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP DEFAULT NULL
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS customers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        contact VARCHAR(100),
        email VARCHAR(100) UNIQUE NOT NULL,
        address TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS suppliers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        contact VARCHAR(100) NOT NULL,
        address TEXT NOT NULL,
        email VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP DEFAULT NULL
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE
      )`);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        sku VARCHAR(100) NOT NULL UNIQUE,
        name VARCHAR(100) NOT NULL,
        stock INT NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        category_id INT NOT NULL,
        supplier_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP DEFAULT NULL,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
        FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE CASCADE
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS purchase_orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_number VARCHAR(100) NOT NULL UNIQUE,
        total_amount DECIMAL(10,2) NOT NULL,
        status ENUM("pending", "completed", "cancelled") NOT NULL DEFAULT "pending",
        order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        supplier_id INT NOT NULL,
        user_id VARCHAR(100) NOT NULL,
        FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS purchase_order_details (
        id INT AUTO_INCREMENT PRIMARY KEY,
        quantity INT NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        purchase_order_id INT NOT NULL,
        product_id INT NOT NULL,
        FOREIGN KEY (purchase_order_id) REFERENCES purchase_orders(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS sales_orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_number VARCHAR(100) NOT NULL UNIQUE,
        customer_id INT NOT NULL,
        total_amount DECIMAL(10,2) NOT NULL,
        status ENUM("pending", "completed", "cancelled") NOT NULL DEFAULT "pending",
        order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        user_id VARCHAR(100) NOT NULL,
        FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS sales_order_details (
        id INT AUTO_INCREMENT PRIMARY KEY,
        quantity INT NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        sales_order_id INT NOT NULL,
        product_id INT NOT NULL,
        FOREIGN KEY (sales_order_id) REFERENCES sales_orders(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS inventory_movements (
        id INT AUTO_INCREMENT PRIMARY KEY,
        quantity INT NOT NULL,
        type ENUM("purchase", "sale", "adjustment") NOT NULL,
        reference_id VARCHAR(100),
        date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        product_id INT NOT NULL,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS adjustments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        product_id INT NOT NULL,
        quantity INT NOT NULL,
        reason ENUM("damaged", "lost", "found", "stock_opname") NOT NULL,
        user_id VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS payments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id INT NOT NULL,
        order_type ENUM("purchase", "sales") NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        payment_method ENUM("cash", "bank_transfer", "credit_card") NOT NULL,
        payment_status ENUM("pending", "completed", "failed") NOT NULL DEFAULT "pending",
        payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS shipments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        tracking_number VARCHAR(100) NOT NULL UNIQUE,
        shipment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        order_id INT NOT NULL,
        order_type ENUM("purchase", "sales") NOT NULL,
        status ENUM("pending", "shipped", "delivered", "cancelled") NOT NULL DEFAULT "pending",
        carrier VARCHAR(100) NOT NULL
      )
    `);

    console.log("Database synced successfully.");
    connection.release();
  } catch (error) {
    console.error("Error syncing database:", error);
  }
};

export { db, syncDatabase };
