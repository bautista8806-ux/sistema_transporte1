const express = require('express');
const router = express.Router();
// Aquí importarías los métodos de tu controlador para rutas, vehículos, etc.

router.get('/rutas', async (req, res) => {
  // Ejemplo de consulta de prueba
  try {
    const db = require('../config/database');
    const [rows] = await db.query('SELECT * FROM rutas');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
