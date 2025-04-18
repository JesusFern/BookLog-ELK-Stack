const express = require('express');
const { createBook, importBooksController } = require('../controllers/bookController');
const router = express.Router();

// Ruta para crear un libro
router.post('/', createBook);

// Ruta para importar libros
router.post('/import-books', importBooksController);

module.exports = router;