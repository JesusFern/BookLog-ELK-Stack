const express = require('express');
const { createBook } = require('../controllers/bookController');
const router = express.Router();

// Ruta para crear un libro
router.post('/', createBook);

module.exports = router;