const Book = require('../models/book');
const User = require('../models/user');
const { createBooksIndex, bulkIndexBooks } = require('../services/elasticBookService');
const { createUsersIndex, bulkIndexUsers } = require('../services/elasticUserService');

const syncElasticWithMongoBooks = async (req, res) => {
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

const syncElasticWithMongoUsers = async (req, res) => {
  try {
    await createUsersIndex();

    const users = await User.find().populate('purchasedBooks');
    await bulkIndexUsers(users);

    res.status(200).json({ message: 'Índice "users" sincronizado con MongoDB.' });
  } catch (err) {
    console.error('❌ Error sincronizando usuarios con Elasticsearch:', err.message);
    res.status(500).json({ error: 'Error sincronizando usuarios con Elasticsearch.' });
  }
};

module.exports = {
  syncElasticWithMongoBooks,
  syncElasticWithMongoUsers
};