const Book = require('../models/book');
const esClient = require('../utils/elasticsearchClient');

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

module.exports = {
  createBook
};