import express from 'express';
import pool from '../config/database.js';
import { verifyToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Obtener todas las tareas (admin obtiene todas, usuario sus asignadas/propias)
router.get('/', verifyToken, async (req, res) => {
  try {
    const connection = await pool.getConnection();

    let query = '';
    let params = [];

    if (req.userRole === 'admin') {
      query = `
        SELECT t.*, u.name AS assignedToName, c.name AS createdByName
        FROM tasks t
        LEFT JOIN users u ON t.assignedTo = u.uid
        LEFT JOIN users c ON t.createdBy = c.uid
        ORDER BY t.createdAt DESC
      `;
    } else {
      query = `
        SELECT t.*, u.name AS assignedToName, c.name AS createdByName
        FROM tasks t
        LEFT JOIN users u ON t.assignedTo = u.uid
        LEFT JOIN users c ON t.createdBy = c.uid
        WHERE t.userId = ? OR t.assignedTo = ?
        ORDER BY t.createdAt DESC
      `;
      params = [req.userId, req.userId];
    }

    const [tasks] = await connection.execute(query, params);
    connection.release();
    res.json(tasks);
  } catch (error) {
    console.error('Error obteniendo tareas:', error);
    res.status(500).json({ error: 'Error al obtener tareas' });
  }
});

// Crear nueva tarea
router.post('/', verifyToken, async (req, res) => {
  try {
    const { title, description, priority, status, assignedTo } = req.body;

    // Validaciones
    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'El título es requerido' });
    }

    if (title.length > 255) {
      return res.status(400).json({ error: 'El título no debe exceder 255 caracteres' });
    }

    const validPriorities = ['baja', 'media', 'alta'];
    const validStatuses = ['pendiente', 'en-progreso', 'completada'];

    if (priority && !validPriorities.includes(priority)) {
      return res.status(400).json({ error: 'Prioridad inválida' });
    }

    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Estado inválido' });
    }

    const connection = await pool.getConnection();

    const taskId = Date.now().toString();
    const taskPriority = priority || 'media';
    const taskStatus = status || 'pendiente';
    const taskDescription = (description || '').trim();
    const assigned = assignedTo || null;

    // Si el usuario no es admin, se ignora assignedTo y se asigna al propio user
    const finalAssignedTo = req.userRole === 'admin' ? assigned : null;
    const createdBy = req.userId;

    await connection.execute(
      'INSERT INTO tasks (id, userId, title, description, priority, status, assignedTo, createdBy) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [taskId, req.userId, title.trim(), taskDescription, taskPriority, taskStatus, finalAssignedTo, createdBy]
    );

    const [newTasks] = await connection.execute(
      `SELECT t.*, u.name AS assignedToName, c.name AS createdByName
       FROM tasks t
       LEFT JOIN users u ON t.assignedTo = u.uid
       LEFT JOIN users c ON t.createdBy = c.uid
       WHERE t.id = ?`,
      [taskId]
    );

    connection.release();

    const newTask = newTasks[0];

    res.status(201).json({
      success: true,
      message: 'Tarea creada correctamente',
      task: newTask
    });
  } catch (error) {
    console.error('Error creando tarea:', error);
    res.status(500).json({ error: 'Error al crear tarea' });
  }
});

// Actualizar tarea
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const { title, description, priority, status } = req.body;
    const taskId = req.params.id;

    const connection = await pool.getConnection();

    // Verificar si la tarea existe
    const [tasks] = await connection.execute(
      'SELECT * FROM tasks WHERE id = ?',
      [taskId]
    );

    if (tasks.length === 0) {
      connection.release();
      return res.status(404).json({ error: 'Tarea no encontrada' });
    }

    const task = tasks[0];

    // Si no es admin, verificar que la tarea está asignada a él
    if (req.userRole !== 'admin') {
      if (task.assignedTo !== req.userId) {
        connection.release();
        return res.status(403).json({ error: 'No tienes permiso para modificar esta tarea' });
      }

      // Un usuario común solo puede modificar el estado
      if (title !== undefined || description !== undefined || priority !== undefined || req.body.assignedTo !== undefined) {
        connection.release();
        return res.status(403).json({ error: 'Solo tienes permitido cambiar el estado de la tarea' });
      }
    }

    // Validaciones
    if (title !== undefined) {
      if (!title || !title.trim()) {
        connection.release();
        return res.status(400).json({ error: 'El título es requerido' });
      }
      if (title.length > 255) {
        connection.release();
        return res.status(400).json({ error: 'El título no debe exceder 255 caracteres' });
      }
    }

    // Construir query dinámicamente
    let updateFields = [];
    let updateValues = [];

    if (title !== undefined) {
      updateFields.push('title = ?');
      updateValues.push(title.trim());
    }

    if (description !== undefined) {
      updateFields.push('description = ?');
      updateValues.push((description || '').trim());
    }

    if (priority !== undefined) {
      const validPriorities = ['baja', 'media', 'alta'];
      if (!validPriorities.includes(priority)) {
        connection.release();
        return res.status(400).json({ error: 'Prioridad inválida' });
      }
      updateFields.push('priority = ?');
      updateValues.push(priority);
    }

    // Permitir cambiar assignedTo solo a admin
    if (req.body.assignedTo !== undefined) {
      if (req.userRole !== 'admin') {
        connection.release();
        return res.status(403).json({ error: 'Solo admin puede reasignar tareas' });
      }
      updateFields.push('assignedTo = ?');
      updateValues.push(req.body.assignedTo || null);
    }

    if (status !== undefined) {
      const validStatuses = ['pendiente', 'en-progreso', 'completada'];
      if (!validStatuses.includes(status)) {
        connection.release();
        return res.status(400).json({ error: 'Estado inválido' });
      }
      updateFields.push('status = ?');
      updateValues.push(status);
    }

    if (updateFields.length > 0) {
      updateValues.push(taskId);
      const query = `UPDATE tasks SET ${updateFields.join(', ')}, updatedAt = NOW() WHERE id = ?`;
      await connection.execute(query, updateValues);
    }

    const [updatedTasks] = await connection.execute(
      `SELECT t.*, u.name AS assignedToName, c.name AS createdByName
       FROM tasks t
       LEFT JOIN users u ON t.assignedTo = u.uid
       LEFT JOIN users c ON t.createdBy = c.uid
       WHERE t.id = ?`,
      [taskId]
    );

    connection.release();

    res.json({
      success: true,
      message: 'Tarea actualizada correctamente',
      task: updatedTasks[0]
    });
  } catch (error) {
    console.error('Error actualizando tarea:', error);
    res.status(500).json({ error: 'Error al actualizar tarea' });
  }
});

// Eliminar tarea (solo admin o creador de la tarea)
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const taskId = req.params.id;

    const connection = await pool.getConnection();

    // Verificar que la tarea existe
    const [tasks] = await connection.execute(
      'SELECT * FROM tasks WHERE id = ?',
      [taskId]
    );

    if (tasks.length === 0) {
      connection.release();
      return res.status(404).json({ error: 'Tarea no encontrada' });
    }

    const task = tasks[0];

    // Solo admin o el creador de la tarea puede eliminarla
    if (req.userRole !== 'admin' && task.userId !== req.userId) {
      connection.release();
      return res.status(403).json({ error: 'No tienes permiso para eliminar esta tarea' });
    }

    await connection.execute('DELETE FROM tasks WHERE id = ?', [taskId]);

    connection.release();

    res.json({
      success: true,
      message: 'Tarea eliminada correctamente',
      task
    });
  } catch (error) {
    console.error('Error eliminando tarea:', error);
    res.status(500).json({ error: 'Error al eliminar tarea' });
  }
});

// Admin: asignar tarea a un usuario
router.put('/assign/:id', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const taskId = req.params.id;
    const { assignedTo } = req.body;

    const connection = await pool.getConnection();

    // Verificar que la tarea existe
    const [tasks] = await connection.execute('SELECT * FROM tasks WHERE id = ?', [taskId]);
    if (tasks.length === 0) {
      connection.release();
      return res.status(404).json({ error: 'Tarea no encontrada' });
    }

    // Verificar que el usuario asignado existe
    if (assignedTo) {
      const [users] = await connection.execute('SELECT uid FROM users WHERE uid = ?', [assignedTo]);
      if (users.length === 0) {
        connection.release();
        return res.status(404).json({ error: 'Usuario asignado no encontrado' });
      }
    }

    await connection.execute('UPDATE tasks SET assignedTo = ?, updatedAt = NOW() WHERE id = ?', [assignedTo || null, taskId]);

    const [updated] = await connection.execute('SELECT * FROM tasks WHERE id = ?', [taskId]);
    connection.release();

    res.json({ success: true, task: updated[0] });
  } catch (error) {
    console.error('Error asignando tarea:', error);
    res.status(500).json({ error: 'Error al asignar tarea' });
  }
});

// Obtener estadísticas (admin ve globales, usuario ve sus asociadas)
router.get('/stats/overview', verifyToken, async (req, res) => {
  try {
    const connection = await pool.getConnection();

    let query = '';
    let params = [];

    if (req.userRole === 'admin') {
      query = `
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN status = 'pendiente' THEN 1 ELSE 0 END) as pendientes,
          SUM(CASE WHEN status = 'en-progreso' THEN 1 ELSE 0 END) as enProgreso,
          SUM(CASE WHEN status = 'completada' THEN 1 ELSE 0 END) as completadas,
          SUM(CASE WHEN priority = 'alta' THEN 1 ELSE 0 END) as altaPrioridad
        FROM tasks
      `;
    } else {
      query = `
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN status = 'pendiente' THEN 1 ELSE 0 END) as pendientes,
          SUM(CASE WHEN status = 'en-progreso' THEN 1 ELSE 0 END) as enProgreso,
          SUM(CASE WHEN status = 'completada' THEN 1 ELSE 0 END) as completadas,
          SUM(CASE WHEN priority = 'alta' THEN 1 ELSE 0 END) as altaPrioridad
        FROM tasks
        WHERE userId = ? OR assignedTo = ?
      `;
      params = [req.userId, req.userId];
    }

    const [stats] = await connection.execute(query, params);
    connection.release();

    const result = stats[0];
    res.json({
      total: result.total || 0,
      pendientes: result.pendientes || 0,
      enProgreso: result.enProgreso || 0,
      completadas: result.completadas || 0,
      altaPrioridad: result.altaPrioridad || 0
    });
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
});

export default router;
