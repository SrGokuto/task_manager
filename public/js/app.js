let currentUser = null;

// Aplicación principal de Task Manager

let allTasks = [];
let filteredTasks = [];
let currentEditingTaskId = null;

// === INICIALIZACIÓN ===

document.addEventListener('DOMContentLoaded', async () => {
  console.log('🚀 Inicializando Task Manager...');

  // Inicializar UI de autenticación
  initializeAuthUI();

  // Cargar tareas y estadísticas
  currentUser = await fetchCurrentUser();
  await loadUsers();

  if (currentUser?.role === 'admin') {
    // Cambiar textos del panel para el administrador
    const navTasksBtn = document.querySelector('.nav-item[data-view="tasks"]');
    if (navTasksBtn) {
      navTasksBtn.innerHTML = '📋 Panel de Tareas';
    }
    const tasksHeaderTitle = document.querySelector('.tasks-header h2');
    if (tasksHeaderTitle) {
      tasksHeaderTitle.textContent = 'Panel de Tareas';
    }
  } else {
    const newTaskBtn = document.getElementById('newTaskBtn');
    if (newTaskBtn) {
      newTaskBtn.style.display = 'none';
    }
  }

  await loadTasks();
  await loadStats();

  // Inicializar event listeners
  initializeEventListeners();
});

// === EVENT LISTENERS ===

function initializeEventListeners() {
  // Navegación
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
      switchView(e.target.dataset.view);
    });
  });

  // Modal y formulario de tareas
  const newTaskBtn = document.getElementById('newTaskBtn');
  const taskModal = document.getElementById('taskModal');
  const taskForm = document.getElementById('taskForm');
  const cancelBtn = document.getElementById('cancelBtn');
  const modalClose = document.querySelector('.modal-close');

  if (newTaskBtn) {
    newTaskBtn.addEventListener('click', openNewTaskModal);
  }

  if (taskForm) {
    taskForm.addEventListener('submit', handleTaskFormSubmit);
  }

  if (cancelBtn) {
    cancelBtn.addEventListener('click', closeTaskModal);
  }

  if (modalClose) {
    modalClose.addEventListener('click', closeTaskModal);
  }

  if (taskModal) {
    taskModal.addEventListener('click', (e) => {
      if (e.target === taskModal) {
        closeTaskModal();
      }
    });
  }

  // Búsqueda y filtros
  const searchInput = document.getElementById('searchInput');
  const statusFilter = document.getElementById('statusFilter');
  const priorityFilter = document.getElementById('priorityFilter');

  if (searchInput) {
    searchInput.addEventListener('input', debounce(filterTasks, 300));
  }

  if (statusFilter) {
    statusFilter.addEventListener('change', filterTasks);
  }

  if (priorityFilter) {
    priorityFilter.addEventListener('change', filterTasks);
  }
}

// === GESTIÓN DE VISTAS ===

function switchView(viewName) {
  // Ocultar todas las vistas
  document.querySelectorAll('.view').forEach(view => {
    view.classList.remove('active');
  });

  // Actualizar nav items
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.remove('active');
  });

  // Mostrar vista seleccionada
  const view = document.getElementById(`${viewName}View`);
  if (view) {
    view.classList.add('active');
  }

  // Marcar nav item como activo
  const navItem = document.querySelector(`[data-view="${viewName}"]`);
  if (navItem) {
    navItem.classList.add('active');
  }
}

// === GESTIÓN DE TAREAS ===

async function loadTasks() {
  try {
    allTasks = await fetchTasks();
    filterTasks();
  } catch (error) {
    console.error('Error cargando tareas:', error);
  }
}

function filterTasks() {
  const searchValue = (document.getElementById('searchInput')?.value || '').toLowerCase();
  const statusValue = document.getElementById('statusFilter')?.value || '';
  const priorityValue = document.getElementById('priorityFilter')?.value || '';

  filteredTasks = allTasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchValue) ||
      task.description.toLowerCase().includes(searchValue);
    const matchesStatus = !statusValue || task.status === statusValue;
    const matchesPriority = !priorityValue || task.priority === priorityValue;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  renderTasks();
}

function renderTasks() {
  const tasksList = document.getElementById('tasksList');
  if (!tasksList) return;

  if (filteredTasks.length === 0) {
    tasksList.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📭</div>
        <h3>No hay tareas</h3>
        <p>Crea una nueva tarea para comenzar</p>
      </div>
    `;
    return;
  }

  tasksList.innerHTML = filteredTasks.map(task => `
    <div class="task-card ${task.status === 'completada' ? 'completed' : ''}">
      <div class="task-content">
        <div class="task-header">
          <span>${getStatusIcon(task.status)}</span>
          <h3 class="task-title">${escapeHtml(task.title)}</h3>
        </div>
        
        ${task.description ? `
          <p class="task-description">${escapeHtml(task.description)}</p>
        ` : ''}
        
        <div class="task-meta">
          <span class="task-badge badge-priority-${task.priority}">
            ${getPriorityIcon(task.priority)} ${capitalize(task.priority)}
          </span>
          <span class="task-badge badge-status-${task.status}">
            ${capitalize(task.status.replace('-', ' '))}
          </span>
          ${task.assignedToName ? `
            <span class="task-badge badge-assigned">
              👤 ${escapeHtml(task.assignedToName)}
            </span>
          ` : `
            <span class="task-badge badge-unassigned">
              👤 Sin asignar
            </span>
          `}
          <span style="color: var(--text-secondary); font-size: 0.85rem;">
            ${formatDate(task.createdAt)}
          </span>
        </div>
      </div>
      
      <div class="task-actions">

${currentUser?.role === 'admin' ? `
  <button
    class="btn-icon edit"
    title="Editar"
    onclick="editTask('${task.id}')">
    ✏️
  </button>

  <button
    class="btn-icon delete"
    title="Eliminar"
    onclick="deleteTaskHandler('${task.id}')">
    🗑️
  </button>
` : `
  <button
    class="btn-icon edit"
    title="${task.status === 'completada' ? 'Marcar como pendiente' : 'Marcar como completada'}"
    onclick="completeTask('${task.id}')">
    ${task.status === 'completada' ? '↩️' : '✅'}
  </button>
`}
    </div>
  `).join('');
}

// === MODAL DE TAREAS ===

function openNewTaskModal() {
  if (currentUser?.role !== 'admin') {
    showAlert('Solo los administradores pueden crear tareas', 'error');
    return;
  }
  currentEditingTaskId = null;
  const modal = document.getElementById('taskModal');
  const form = document.getElementById('taskForm');

  clearForm('taskForm');
  document.getElementById('modalTitle').textContent = 'Nueva Tarea';

  const assignedToGroup = document.getElementById('assignedToGroup');
  if (assignedToGroup) {
    assignedToGroup.style.display = currentUser?.role === 'admin' ? 'block' : 'none';
  }

  if (modal) {
    modal.classList.remove('hidden');
  }
}

function editTask(taskId) {
  if (currentUser?.role !== 'admin') {
    return;
  }
  const task = allTasks.find(t => t.id === taskId);
  if (!task) return;

  currentEditingTaskId = taskId;

  document.getElementById('taskTitle').value = task.title;
  document.getElementById('taskDescription').value = task.description;
  document.getElementById('taskPriority').value = task.priority;
  document.getElementById('taskStatus').value = task.status;

  const assignedToSelect = document.getElementById('assignedTo');
  if (assignedToSelect) {
    assignedToSelect.value = task.assignedTo || '';
  }

  const assignedToGroup = document.getElementById('assignedToGroup');
  if (assignedToGroup) {
    assignedToGroup.style.display = currentUser?.role === 'admin' ? 'block' : 'none';
  }

  document.getElementById('modalTitle').textContent = 'Editar Tarea';

  const modal = document.getElementById('taskModal');
  if (modal) {
    modal.classList.remove('hidden');
  }
}

function closeTaskModal() {
  const modal = document.getElementById('taskModal');
  if (modal) {
    modal.classList.add('hidden');
  }
  currentEditingTaskId = null;
  clearForm('taskForm');
}

async function handleTaskFormSubmit(e) {
  const assignedTo =
    document.getElementById('assignedTo')?.value;
  e.preventDefault();

  const title = document.getElementById('taskTitle').value.trim();
  const description = document.getElementById('taskDescription').value.trim();
  const priority = document.getElementById('taskPriority').value;
  const status = document.getElementById('taskStatus').value;

  // Validaciones
  if (!title) {
    document.getElementById('titleError').textContent = 'El título es requerido';
    return;
  }

  if (title.length > 100) {
    document.getElementById('titleError').textContent = 'El título no debe exceder 100 caracteres';
    return;
  }

  const taskData = {
    title,
    description,
    priority,
    status,
    assignedTo
  };

  try {
    if (currentEditingTaskId) {
      await updateTask(currentEditingTaskId, taskData);
    } else {
      await createTask(taskData);
    }

    closeTaskModal();
    await loadTasks();
    await loadStats();
  } catch (error) {
    console.error('Error guardando tarea:', error);
  }
}

async function deleteTaskHandler(taskId) {
  if (confirm('¿Estás seguro de que deseas eliminar esta tarea?')) {
    try {
      await deleteTask(taskId);
      await loadTasks();
      await loadStats();
    } catch (error) {
      console.error('Error eliminando tarea:', error);
    }
  }
}
async function completeTask(taskId) {
  const task = allTasks.find(t => t.id === taskId);
  if (!task) return;
  const newStatus = task.status === 'completada' ? 'pendiente' : 'completada';
  try {
    await updateTask(taskId, {
      status: newStatus
    });

    await loadTasks();
    await loadStats();
  } catch (error) {
    console.error(error);
  }
}

// === ESTADÍSTICAS ===

async function loadStats() {
  try {
    const stats = await fetchStats();
    if (stats) {
      updateStatsDisplay(stats);
    }
  } catch (error) {
    console.error('Error cargando estadísticas:', error);
  }
}

function updateStatsDisplay(stats) {
  // Actualizar números
  document.getElementById('totalTasks').textContent = stats.total;
  document.getElementById('pendingTasks').textContent = stats.pendientes;
  document.getElementById('inProgressTasks').textContent = stats.enProgreso;
  document.getElementById('completedTasks').textContent = stats.completadas;
  document.getElementById('highPriorityTasks').textContent = stats.altaPrioridad;

  // Actualizar barras de progreso
  const total = stats.total || 1;

  const completedPercent = Math.round((stats.completadas / total) * 100);
  const inProgressPercent = Math.round((stats.enProgreso / total) * 100);
  const pendingPercent = Math.round((stats.pendientes / total) * 100);

  const completedProgress = document.getElementById('completedProgress');
  const inProgressProgress = document.getElementById('inProgressProgress');
  const pendingProgress = document.getElementById('pendingProgress');

  if (completedProgress) {
    completedProgress.style.width = completedPercent + '%';
    completedProgress.textContent = completedPercent > 10 ? completedPercent + '%' : '';
  }

  if (inProgressProgress) {
    inProgressProgress.style.width = inProgressPercent + '%';
    inProgressProgress.textContent = inProgressPercent > 10 ? inProgressPercent + '%' : '';
  }

  if (pendingProgress) {
    pendingProgress.style.width = pendingPercent + '%';
    pendingProgress.textContent = pendingPercent > 10 ? pendingPercent + '%' : '';
  }

  document.getElementById('completedPercent').textContent = completedPercent + '%';
  document.getElementById('inProgressPercent').textContent = inProgressPercent + '%';
  document.getElementById('pendingPercent').textContent = pendingPercent + '%';
}

// === UTILIDADES ===

function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

async function loadUsers() {
  if (currentUser?.role !== 'admin')
    return;

  const users = await fetchUsers();
  const select = document.getElementById('assignedTo');

  if (!select)
    return;

  select.innerHTML = '<option value="">No asignado</option>';

  users.forEach(user => {
    select.innerHTML += `
      <option value="${user.uid}">
        ${user.name} (${user.email})
      </option>
    `;
  });
}