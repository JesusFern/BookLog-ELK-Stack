const express = require('express');
const { 
    createBook, 
    importBooksController, 
    searchByTitle, 
    multiMatchSearchWithPagination,
    searchByAuthor,
    searchByGenre,
    searchByPriceRange,
    fuzzySearchByTitle
} = require('../controllers/bookController');

const router = express.Router();

// Ruta para crear un libro
router.post('/', createBook);

// Ruta para importar libros
router.post('/import-books', importBooksController);

// Rutas para buscar libros
router.get('/search/title', searchByTitle);
router.get('/search/author', searchByAuthor);
router.get('/search/genre', searchByGenre);
router.get('/search/price-range', searchByPriceRange);
router.get('/search/pagination', multiMatchSearchWithPagination);
router.get('/search/fuzzy-title', fuzzySearchByTitle);

module.exports = router;