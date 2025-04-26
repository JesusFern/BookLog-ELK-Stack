const express = require('express');
const { 
    createBook, 
    importBooksController, 
    searchByTitle, 
    multiMatchFuzzySearch,
    searchByAuthor,
    searchByGenre,
    searchByPriceRange,
    fuzzySearchByTitle,
    getBooks,
    getBookById,
    getTopBooks,
    getRelatedBooks,
    getSuggestions
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
router.get('/search/pagination', multiMatchFuzzySearch);
router.get('/search/fuzzy-title', fuzzySearchByTitle);
router.get('/books', getBooks);
router.get('/top-books', getTopBooks);
router.get('/suggestions', getSuggestions);

router.get('/related/:bookId', getRelatedBooks);
router.get('/:id', getBookById);



module.exports = router;