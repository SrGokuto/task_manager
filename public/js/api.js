// Funciones para llamadas a API

/**
 * Realiza una llamada a la API
 * @param {string} endpoint - URL del endpoint
 * @param {string} method - Método HTTP (GET, POST, PUT, DELETE)
 * @param {object} data - Datos a enviar
 * @returns {Promise} Respuesta de la API
 */
async function apiCall(endpoint, method = 'GET', data = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json'
    }
  };

  // Agregar token si está disponible
  const token = getToken();
  if (token) {
    options.headers['Authorization'] = `Bearer ${token}`;
  }

  // Agregar body si hay datos
  if (data) {
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(endpoint, options);
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Error en la solicitud');
    }

    return result;
  } catch (error) {
    throw error;
  }
}

// === TAREAS ===

/**
 * Obtiene todas las tareas del usuario
 */
async function fetchTasks() {
  try {
    return await apiCall('/api/tasks', 'GET');
  } catch (error) {
    showAlert(`Error al cargar tareas: ${error.message}`, 'error');
    return [];
  }
}

/**
 * Crea una nueva tarea
 */
async function createTask(taskData) {
  try {
    const response = await apiCall('/api/tasks', 'POST', taskData);
    showAlert('Tarea creada correctamente', 'success');
    return response.task;
  } catch (error) {
    showAlert(`Error al crear tarea: ${error.message}`, 'error');
    throw error;
  }
}

/**
 * Actualiza una tarea
 */
async function updateTask(taskId, taskData) {
  try {
    const response = await apiCall(`/api/tasks/${taskId}`, 'PUT', taskData);
    showAlert('Tarea actualizada correctamente', 'success');
    return response.task;
  } catch (error) {
    showAlert(`Error al actualizar tarea: ${error.message}`, 'error');
    throw error;
  }
}

/**
 * Elimina una tarea
 */
async function deleteTask(taskId) {
  try {
    await apiCall(`/api/tasks/${taskId}`, 'DELETE');
    showAlert('Tarea eliminada correctamente', 'success');
  } catch (error) {
    showAlert(`Error al eliminar tarea: ${error.message}`, 'error');
    throw error;
  }
}

/**
 * Obtiene las estadísticas del usuario
 */
async function fetchStats() {
  try {
    return await apiCall('/api/tasks/stats/overview', 'GET');
  } catch (error) {
    console.error('Error al cargar estadísticas:', error);
    return null;
  }
}

// === AUTENTICACIÓN ===

/**
 * Verifica el token actual
 */
async function verifyToken() {
  try {
    const response = await apiCall('/api/auth/verify', 'POST');
    return response.valid;
  } catch (error) {
    return false;
  }
}

// === ADMIN ===

/**
 * Obtiene todos los usuarios
 */
async function fetchUsers() {
  try {
    return await apiCall('/api/users', 'GET');
  } catch (error) {
    showAlert(`Error al cargar usuarios: ${error.message}`, 'error');
    return [];
  }
}

/**
 * Asigna una tarea a un usuario
 */
async function assignTask(taskId, assignedTo) {
  try {
    const response = await apiCall(
      `/api/tasks/assign/${taskId}`,
      'PUT',
      { assignedTo }
    );

    showAlert('Tarea asignada correctamente', 'success');

    return response.task;
  } catch (error) {
    showAlert(`Error al asignar tarea: ${error.message}`, 'error');
    throw error;
  }
}

/**
 * Obtiene información del usuario actual
 */
async function fetchCurrentUser() {
  try {
    return await apiCall('/api/auth/me', 'GET');
  } catch (error) {
    return null;
  }
}