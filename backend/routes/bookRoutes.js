const express = require('express');
const { 
    createBook, 
    importBooksController, 
    searchByTitle, 
    multiMatchSearchWithPagination 
} = require('../controllers/bookController');
const router = express.Router();

// Ruta para crear un libro
router.post('/', createBook);

// Ruta para importar libros
router.post('/import-books', importBooksController);

// Rutas para buscar libros
router.get('/search/title', searchByTitle);
router.get('/search/pagination', multiMatchSearchWithPagination);

module.exports = router;