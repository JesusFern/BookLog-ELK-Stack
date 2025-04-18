const Book = require('../models/book');
const esClient = require('../utils/elasticsearchClient');
const importBooks = require('../services/importBooks');

// Crear un libro
const createBook = async (req, res) => {
  try {
    const book = new Book(req.body);
    const savedBook = await book.save();

    // Indexar en Elasticsearch
    await esClient.index({
      index: 'books',
      id: savedBook._id.toString(),
      document: {
        title: savedBook.title,
        author: savedBook.author,
        genre: savedBook.genre,
        summary: savedBook.summary,
        language: savedBook.language,
        price: savedBook.price,
        format: savedBook.format,
        coverImageUrl: savedBook.coverImageUrl,
        downloadFileUrls: savedBook.downloadFileUrls,
        createdAt: savedBook.createdAt
      }
    });

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

module.exports = {
  createBook,
  importBooksController,
};