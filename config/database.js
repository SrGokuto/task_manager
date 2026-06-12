import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Crear pool de conexiones
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3305,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'task_manager',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Función para inicializar la base de datos
export async function initializeDatabase() {
  try {
    const connection = await pool.getConnection();

    // Crear tabla de usuarios (con rol)
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        uid VARCHAR(50) PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        name VARCHAR(255) NOT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('admin','user') DEFAULT 'user',
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Crear tabla de tareas (con assignedTo y createdBy)
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS tasks (
        id VARCHAR(50) PRIMARY KEY,
        userId VARCHAR(50) NOT NULL,
        title VARCHAR(255) NOT NULL,
        description LONGTEXT,
        priority ENUM('baja', 'media', 'alta') DEFAULT 'media',
        status ENUM('pendiente', 'en-progreso', 'completada') DEFAULT 'pendiente',
        assignedTo VARCHAR(50) DEFAULT NULL,
        createdBy VARCHAR(50) DEFAULT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(uid) ON DELETE CASCADE,
        FOREIGN KEY (assignedTo) REFERENCES users(uid) ON DELETE SET NULL,
        FOREIGN KEY (createdBy) REFERENCES users(uid) ON DELETE SET NULL,
        INDEX idx_userId (userId),
        INDEX idx_assignedTo (assignedTo),
        INDEX idx_status (status),
        INDEX idx_priority (priority)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    connection.release();
    console.log('✅ Base de datos inicializada correctamente');
  } catch (error) {
    console.error('❌ Error inicializando la base de datos:', error);
    throw error;
  }
}

export default pool;
