const express = require('express');
const { 
    createBook, 
    importBooksController, 
    multiMatchFuzzySearch,
    getBooks,
    getBookById,
    getTopBooks,
    getRelatedBooks,
    getSuggestions,
    searchWithFilters,
    getTotalBooks,
    simulateBuy
} = require('../controllers/bookController');

const router = express.Router();

// Ruta para crear un libro
router.post('/', createBook);

// Ruta para importar libros
router.post('/import-books', importBooksController);
router.post('/simulate-buy', simulateBuy);

// Rutas para buscar libros
router.get('/search/pagination', multiMatchFuzzySearch);
router.get('/books', getBooks);
router.get('/top-books', getTopBooks);
router.get('/suggestions', getSuggestions);
router.get('/search/filters', searchWithFilters);
router.get('/total-books', getTotalBooks)
router.get('/related/:bookId', getRelatedBooks);
router.get('/:id', getBookById);



module.exports = router;