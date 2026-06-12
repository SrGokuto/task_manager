// Utilidades globales

/**
 * Muestra una alerta al usuario
 * @param {string} message - Mensaje a mostrar
 * @param {string} type - Tipo: 'success', 'error', 'info'
 * @param {number} duration - Duración en milisegundos
 */
function showAlert(message, type = 'info', duration = 3000) {
  const container = document.getElementById('alertContainer');
  if (!container) return;

  const alert = document.createElement('div');
  alert.className = `alert ${type}`;
  alert.innerHTML = `
    ${type === 'success' ? '✓' : type === 'error' ? '✗' : 'ℹ'} ${message}
    <button class="alert-close">&times;</button>
  `;

  container.appendChild(alert);

  const closeBtn = alert.querySelector('.alert-close');
  closeBtn.addEventListener('click', () => {
    alert.remove();
  });

  if (duration > 0) {
    setTimeout(() => {
      alert.remove();
    }, duration);
  }
}

/**
 * Valida un email
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Formatea una fecha
 */
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Obtiene el color del icono basado en prioridad
 */
function getPriorityIcon(priority) {
  switch (priority) {
    case 'alta':
      return '🔴';
    case 'media':
      return '🟡';
    case 'baja':
      return '🟢';
    default:
      return '⚪';
  }
}

/**
 * Obtiene el icono del estado
 */
function getStatusIcon(status) {
  switch (status) {
    case 'completada':
      return '✅';
    case 'en-progreso':
      return '🔄';
    case 'pendiente':
      return '⏳';
    default:
      return '❓';
  }
}

/**
 * Debounce para búsqueda
 */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Limpia un formulario
 */
function clearForm(formId) {
  const form = document.getElementById(formId);
  if (form) {
    form.reset();
    form.querySelectorAll('.error-message').forEach(el => el.textContent = '');
  }
}

/**
 * Capitaliza la primera letra
 */
function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Verifica si el usuario está autenticado
 */
function isAuthenticated() {
  return !!localStorage.getItem('token');
}

/**
 * Obtiene el usuario actual
 */
function getCurrentUser() {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
}

/**
 * Obtiene el token JWT
 */
function getToken() {
  return localStorage.getItem('token');
}

/**
 * Cierra la sesión
 */
function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/login';
}
