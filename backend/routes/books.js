const express = require('express');
const router = express.Router();

// Ejemplo de una ruta válida
router.get('/', (req, res) => {
  res.send('Lista de libros');
});

module.exports = router;