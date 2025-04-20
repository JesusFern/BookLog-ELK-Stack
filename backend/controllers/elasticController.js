const Book = require('../models/book');
const { createBooksIndex, bulkIndexBooks } = require('../services/elasticBookService');

const syncElasticWithMongo = async (req, res) => {
  try {
    await createBooksIndex();

    const books = await Book.find();
    await bulkIndexBooks(books);

    res.status(200).json({ message: 'Índice "books" actualizado y sincronizado con MongoDB.' });
  } catch (err) {
    console.error('❌ Error sincronizando Elasticsearch con MongoDB:', err.message);
    res.status(500).json({ error: 'Error sincronizando Elasticsearch con MongoDB.' });
  }
};

module.exports = {
  syncElasticWithMongo,
};