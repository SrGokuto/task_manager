-- Script de creación de base de datos Task Manager
-- Ejecutar este script en MariaDB/MySQL antes de iniciar la aplicación

-- Crear base de datos
CREATE DATABASE IF NOT EXISTS task_manager;
USE task_manager;

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS users (
  uid VARCHAR(50) PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin','user') DEFAULT 'user',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de tareas
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ✅ Base de datos lista
