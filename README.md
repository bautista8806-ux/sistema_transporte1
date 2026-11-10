# Sistema de transporte

## Inicio rápido (Windows PowerShell)

Abre la terminal en esta carpeta del proyecto y ejecuta:

```powershell
Copy-Item .env.example .env
npm install
npm start
```

Antes de iniciar, importa `backend/database/schema.sql` en MySQL y ajusta los datos de conexión del archivo `.env`. Cuando la terminal muestre `Sistema de transporte disponible en http://localhost:3000`, deja esa terminal abierta y abre esa dirección en el navegador. La terminal queda ocupada por el servidor; la navegación se hace en el navegador.

No abras `backend/index.html` con doble clic (`file://`): la página necesita que Node.js sirva los archivos y las rutas `/api`.

## Si el puerto está ocupado

En `.env`, cambia `PORT=3000` por `PORT=3001`; después abre `http://localhost:3001`.

La API está en `/api`, el estado de conexión con MySQL en `/api/health` y la implementación por capas en `backend/src`.
