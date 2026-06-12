# Guía de Despliegue en Vercel

## Requisitos Previos

1. **Cuenta en GitHub** - Crear un repositorio público o privado
2. **Cuenta en Vercel** - [Registrarse aquí](https://vercel.com)
3. **Git instalado** - En tu máquina local

## Paso 1: Inicializar Git y hacer Push

```bash
# En la carpeta del proyecto
cd /home/jeonardo/Documentos/BasuraLuna2

# Inicializar repositorio git
git init

# Agregar archivos
git add .

# Commit inicial
git commit -m "Initial commit: Task Manager application"

# Agregar origin remoto (reemplazar con tu repo)
git remote add origin https://github.com/tu-usuario/task-manager-app.git

# Push al repositorio
git branch -M main
git push -u origin main
```

## Paso 2: Conectar a Vercel

### Opción A: Desde la CLI de Vercel

```bash
# Instalar Vercel CLI (si no lo tienes)
npm i -g vercel

# Conectar a Vercel
vercel
```

Seguir las instrucciones en la terminal.

### Opción B: Desde el Dashboard de Vercel

1. Ir a [https://vercel.com/dashboard](https://vercel.com/dashboard)
2. Hacer clic en "New Project"
3. Seleccionar el repositorio de GitHub
4. Configurar variables de entorno (ver paso 3)
5. Hacer clic en "Deploy"

## Paso 3: Configurar Variables de Entorno

En Vercel Dashboard:

1. Ir a tu proyecto
2. Settings → Environment Variables
3. Agregar las siguientes variables:

```
PORT=3000
NODE_ENV=production
JWT_SECRET=tu-secret-seguro-aqui-cambiar-en-produccion
DB_TYPE=firebase
```

## Paso 4: Deploy

Una vez configurado, el deploy es automático:

- Cada push a `main` dispara un deploy
- Vercel crea una URL pública automáticamente
- Puedes ver el estado del deploy en el dashboard

## Estructura para Vercel

El proyecto ya está listo para Vercel. Vercel detectará que es una aplicación Node.js y:

1. Instalará dependencias (`npm install`)
2. Ejecutará el servidor (`npm start`)
3. Asignará un dominio único

## URLs de Ejemplo

- **Production**: `https://task-manager-app.vercel.app`
- **Preview**: `https://task-manager-app-git-main-tu-usuario.vercel.app`

## Solucionar Problemas

### Error: "Module not found"
- Asegurar que `package.json` esté en la raíz
- Verificar que todas las dependencias estén listadas

### Error: "PORT not available"
- Vercel asigna el puerto automáticamente
- No forzar el puerto en producción

### Error de autenticación
- Verificar que JWT_SECRET esté configurado
- Asegurarse de usar el mismo SECRET que en desarrollo

## Commits Frecuentes

Mantener el historial de desarrollo:

```bash
# Hacer cambios...

# Agregar cambios
git add .

# Commit con mensaje descriptivo
git commit -m "feat: agregar búsqueda de tareas"

# Push
git push
```

## URLs Útiles

- 📝 Documentación de Vercel: https://vercel.com/docs
- 🚀 Dashboard: https://vercel.com/dashboard
- 📚 Node.js en Vercel: https://vercel.com/docs/nodejs

---

¡Tu aplicación está lista para ser deployada! 🎉
