# Task Manager - Aplicación de Gestión de Tareas

Una aplicación web moderna para gestionar tareas personales con autenticación de usuarios, búsqueda, filtros y estadísticas.

## Características

✅ **CRUD Completo**
- Crear, leer, actualizar y eliminar tareas
- Interfaz intuitiva y responsiva

✅ **Autenticación de Usuarios**
- Registro e inicio de sesión
- Contraseñas encriptadas con bcryptjs
- Tokens JWT para sesiones seguras

✅ **Validaciones Avanzadas**
- Validación de formularios en cliente y servidor
- Manejo de errores
- Mensajes de retroalimentación

✅ **Búsqueda y Filtros**
- Buscar tareas por título o descripción
- Filtrar por estado (Pendiente, En progreso, Completada)
- Filtrar por prioridad (Baja, Media, Alta)

✅ **Dashboard y Estadísticas**
- Vista general de tareas
- Contadores por estado
- Gráfico de progreso

✅ **Base de Datos en Línea**
- Firebase Firestore para almacenamiento
- Sincronización en tiempo real

## Tecnologías Utilizadas

### Frontend
- HTML5
- CSS3 (Diseño responsivo)
- JavaScript Vanilla (ES6+)

### Backend
- Node.js
- Express.js
- Firebase Admin SDK
- bcryptjs para encriptación
- JWT para autenticación

## Instalación

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/tu-usuario/task-manager-app.git
   cd task-manager-app
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   Crear archivo `.env` en la raíz:
   ```
   PORT=3000
   NODE_ENV=development
   JWT_SECRET=tu_jwt_secret_aqui
   FIREBASE_PROJECT_ID=tu_project_id
   FIREBASE_PRIVATE_KEY=tu_private_key
   FIREBASE_CLIENT_EMAIL=tu_client_email
   ```

4. **Descargar credenciales de Firebase**
   - Ir a [Firebase Console](https://console.firebase.google.com)
   - Crear proyecto "Task Manager"
   - Descargar JSON de credenciales de cuenta de servicio
   - Guardar en `config/firebase-key.json`

5. **Iniciar servidor**
   ```bash
   npm start
   ```
   La aplicación estará disponible en `http://localhost:3000`

## Estructura del Proyecto

```
task-manager-app/
├── public/
│   ├── index.html
│   ├── login.html
│   ├── register.html
│   ├── css/
│   │   ├── styles.css
│   │   ├── auth.css
│   │   └── dashboard.css
│   └── js/
│       ├── app.js
│       ├── auth.js
│       ├── api.js
│       └── utils.js
├── config/
│   └── firebase.js
├── routes/
│   ├── auth.js
│   └── tasks.js
├── middleware/
│   └── auth.js
├── server.js
├── package.json
├── .env
└── README.md
```

## Uso

### Registrarse
1. Ir a `/register.html`
2. Completar formulario con email y contraseña
3. Se crea automáticamente una cuenta

### Iniciar Sesión
1. Ir a `/login.html`
2. Ingresar credenciales
3. Acceder al dashboard de tareas

### Gestionar Tareas
- **Crear**: Hacer clic en "Nueva Tarea"
- **Editar**: Hacer clic en el icono de editar
- **Eliminar**: Hacer clic en el icono de eliminar
- **Buscar**: Usar la barra de búsqueda
- **Filtrar**: Seleccionar estado o prioridad

## URL de Despliegue

🚀 Aplicación en vivo: https://task-manager-app.vercel.app

## Guía de Despliegue en Vercel

1. Hacer push al repositorio de GitHub
2. Conectar repositorio en [Vercel](https://vercel.com)
3. Configurar variables de entorno en Vercel
4. Deploy automático en cada push

## API Endpoints

### Autenticación
- `POST /api/auth/register` - Registrar nuevo usuario
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/logout` - Cerrar sesión

### Tareas
- `GET /api/tasks` - Obtener todas las tareas del usuario
- `POST /api/tasks` - Crear nueva tarea
- `PUT /api/tasks/:id` - Actualizar tarea
- `DELETE /api/tasks/:id` - Eliminar tarea
- `GET /api/tasks/search/:query` - Buscar tareas
- `GET /api/stats` - Obtener estadísticas

## Contribuir

Las contribuciones son bienvenidas. Por favor:
1. Fork el proyecto
2. Crear rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## Licencia

Este proyecto está bajo licencia ISC.

## Autor

Desarrollado como proyecto de aprendizaje en desarrollo web full-stack.

---

**Última actualización:** 10 de junio de 2026
