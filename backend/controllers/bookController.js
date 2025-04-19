const Book = require('../models/book');
const esClient = require('../utils/elasticsearchClient');
const importBooks = require('../services/importBooksService');
const { indexBook } = require('../services/elasticService');

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

module.exports = {
  createBook,
  importBooksController,
  searchByTitle,
  multiMatchSearchWithPagination
};