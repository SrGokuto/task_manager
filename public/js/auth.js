// Funciones de autenticación

/**
 * Protege la ruta si el usuario no está autenticado
 */
async function protectRoute() {
  // En login y register, no permitir si ya está autenticado
  const loginRegexPattern = /\/(login|register)/;
  const isAuthPage = loginRegexPattern.test(window.location.pathname);

  if (isAuthPage) {
    if (isAuthenticated()) {
      // Si ya está autenticado, redirigir al dashboard
      window.location.href = '/';
    }
    return;
  }

  // Para otras páginas, verificar autenticación
  if (!isAuthenticated()) {
    window.location.href = '/login';
    return;
  }

  // Verificar que el token sea válido
  const isValid = await verifyToken();
  if (!isValid) {
    logout();
  }
}

/**
 * Inicializa la interfaz de autenticación
 */
function initializeAuthUI() {
  const user = getCurrentUser();
  
  // Mostrar email del usuario
  const userEmailEl = document.getElementById('userEmail');
  if (userEmailEl && user) {
    userEmailEl.textContent = user.email;
  }

  // Botón de logout
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', logout);
  }
}

// Ejecutar protección de rutas al cargar
document.addEventListener('DOMContentLoaded', protectRoute);
