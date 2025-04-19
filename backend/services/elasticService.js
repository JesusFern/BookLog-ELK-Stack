const esClient = require('../utils/elasticsearchClient');

// Función para indexar un libro en Elasticsearch
const indexBook = async (book) => {
  try {
    await esClient.index({
      index: 'books',
      id: book._id.toString(),
      document: {
        title: book.title,
        author: book.author,
        genre: book.genre,
        summary: book.summary,
        language: book.language,
        price: book.price,
        format: book.format,
        coverImageUrl: book.coverImageUrl,
        downloadFileUrls: book.downloadFileUrls,
        publishedYear: book.publishedYear,
        numPages: book.numPages,
        createdAt: book.createdAt,
      },
    });
    console.log(`📘 Libro "${book.title}" indexado en Elasticsearch.`);
  } catch (err) {
    console.error('❌ Error al indexar el libro en Elasticsearch:', err.message);
    throw err;
  }
};

module.exports = {
  indexBook,
};