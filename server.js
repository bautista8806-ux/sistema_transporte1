require('dotenv').config();
const express = require('express');
const path = require('path');
const db = require('./src/config/database');
const api = require('./src/routes/transportRoutes');

const app = express();
app.use(express.json({ limit: '1mb' }));
app.use(express.static(path.join(__dirname, 'public')));
app.get('/api/health', async (_req,res) => {
  try { await db.query('SELECT 1'); res.json({ status: 'ok', database: 'connected' }); }
  catch { res.status(503).json({ status: 'error', database: 'disconnected' }); }
});
app.use('/api', api);
app.use((error,_req,res,_next) => {
  const status = error.status || (error.code === 'ER_DUP_ENTRY' || error.code === 'ER_ROW_IS_REFERENCED_2' ? 409 : error.code === 'ER_NO_REFERENCED_ROW_2' ? 400 : 500);
  res.status(status).json({ error: status === 500 ? 'No se pudo completar la operación. Verifica la conexión y los datos.' : error.message });
});
const port = Number(process.env.PORT || 3000);
app.listen(port, () => console.log(`Sistema de transporte disponible en http://localhost:${port}`));
