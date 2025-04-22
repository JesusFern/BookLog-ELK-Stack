const Book = require('../models/book');
const esClient = require('../utils/elasticsearchClient');
const importBooks = require('../services/importBooksService');
const { indexBook } = require('../services/elasticBookService');

// Crear un libro
const createBook = async (req, res) => {
  try {
    const book = new Book(req.body);
    const savedBook = await book.save();

    // Indexar en Elasticsearch usando el servicio
    await indexBook(savedBook);

    res.status(201).json(savedBook);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const importBooksController = async (req, res) => {
  try {
    const { shouldDelete } = req.body; // Obtén el parámetro desde el cuerpo de la solicitud
    console.log(`📚 Iniciando importación de libros... (shouldDelete: ${shouldDelete})`);

    await importBooks(shouldDelete); // Pasa el parámetro al servicio
    res.status(200).json({ message: 'Importación de libros completada con éxito.' });
  } catch (err) {
    console.error('❌ Error durante la importación de libros:', err.message);
    res.status(500).json({ error: 'Error durante la importación de libros.' });
  }
};

const searchByTitle = async (req, res) => {
  try {
    const { title } = req.query;
    const response = await esClient.search({
      index: 'books',
      query: {
        match: {
          title: title,
        },
      },
    });

    res.status(200).json(response.hits.hits.map(hit => hit._source));
  } catch (err) {
    console.error('❌ Error buscando por título:', err.message);
    res.status(500).json({ error: 'Error buscando por título.' });
  }
};

const searchByAuthor = async (req, res) => {
  try {
    const { author } = req.query;
    const response = await esClient.search({
      index: 'books',
      query: {
        match: {
          author: author, // Busca coincidencias en el campo "author"
        },
      },
    });

    res.status(200).json(response.hits.hits.map(hit => hit._source));
  } catch (err) {
    console.error('❌ Error buscando por autor:', err.message);
    res.status(500).json({ error: 'Error buscando por autor.' });
  }
};

const searchByGenre = async (req, res) => {
  try {
    const { genre } = req.query;
    const response = await esClient.search({
      index: 'books',
      query: {
        match: {
          genre: genre, // Busca coincidencias en el campo "genre"
        },
      },
    });

    res.status(200).json(response.hits.hits.map(hit => hit._source));
  } catch (err) {
    console.error('❌ Error buscando por género:', err.message);
    res.status(500).json({ error: 'Error buscando por género.' });
  }
};

const searchByPriceRange = async (req, res) => {
  try {
    const { minPrice, maxPrice } = req.query;
    const response = await esClient.search({
      index: 'books',
      query: {
        range: {
          price: {
            gte: parseFloat(minPrice), // Precio mínimo
            lte: parseFloat(maxPrice), // Precio máximo
          },
        },
      },
    });

    res.status(200).json(response.hits.hits.map(hit => hit._source));
  } catch (err) {
    console.error('❌ Error buscando por rango de precios:', err.message);
    res.status(500).json({ error: 'Error buscando por rango de precios.' });
  }
};

const multiMatchSearchWithPagination = async (req, res) => {
  try {
    const { query, page = 1} = req.query;
    const size = 10;
    const response = await esClient.search({
      index: 'books',
      from: (page - 1) * size,
      size: parseInt(size),
      query: {
        multi_match: {
          query: query,
          fields: ['title', 'author', 'genre', 'summary'],
        },
      },
    });

    const total = response.hits.total.value;
    const totalPages = Math.ceil(total / size);

    res.status(200).json({
      total, // Total de documentos
      page: parseInt(page), // Página actual
      size: parseInt(size), // Tamaño de la página
      totalPages, // Total de páginas
      results: response.hits.hits.map(hit => hit._source), // Resultados de la página actual
    });
  } catch (err) {
    console.error('❌ Error buscando con paginación:', err.message);
    res.status(500).json({ error: 'Error buscando con paginación.' });
  }
};

const fuzzySearchByTitle = async (req, res) => {
  try {
    const { title } = req.query;
    const response = await esClient.search({
      index: 'books',
      query: {
        match: {
          title: {
            query: title,
            fuzziness: "AUTO", // Permite errores tipográficos
          },
        },
      },
    });

    res.status(200).json(response.hits.hits.map(hit => hit._source));
  } catch (err) {
    console.error('❌ Error en búsqueda difusa por título:', err.message);
    res.status(500).json({ error: 'Error en búsqueda difusa por título.' });
  }
};


const getBooks = async (req, res) => {
  try {
    const books = await Book.find();
    res.status(200).json(books);
  } catch (err) {
    console.error('❌ Error obteniendo libros:', err.message);
    res.status(500).json({ error: 'Error obteniendo libros.' });
  }
}


const getBookById = async (req, res) => {
  try {
    const { id } = req.params;
    const book = await Book.findById(id);
    if (!book) {
      return res.status(404).json({ error: 'Libro no encontrado.' });
    }
    res.status(200).json(book);
  } catch (err) {
    console.error('❌ Error obteniendo libro por ID:', err.message);
    res.status(500).json({ error: 'Error obteniendo libro por ID.' });
  }
}

module.exports = {
  createBook,
  importBooksController,
  searchByTitle,
  searchByAuthor,
  searchByGenre,
  searchByPriceRange,
  multiMatchSearchWithPagination,
  fuzzySearchByTitle,
  getBooks,
  getBookById,
};