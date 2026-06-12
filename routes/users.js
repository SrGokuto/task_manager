import express from 'express';
import pool from '../config/database.js';
import { verifyToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Obtener todos los usuarios (solo para administradores)
router.get('/', verifyToken, requireAdmin, async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [users] = await connection.execute(
      'SELECT uid, email, name, role FROM users ORDER BY name ASC'
    );
    connection.release();
    res.json(users);
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

export default router;
