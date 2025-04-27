const Book = require('../models/book');
const User = require('../models/user');
const { createBooksIndex, bulkIndexBooks } = require('../services/elasticBookService');
const { createUsersIndex, bulkIndexUsers } = require('../services/elasticUserService');

const syncElasticWithMongoBooks = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]; // Obtener el token del header Authorization
    if (!token) {
      return res.status(401).json({ error: 'No autorizado.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded.isAdmin) {
      return res.status(403).json({ error: 'Acceso denegado. No eres administrador.' });
    }

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
    const token = req.headers.authorization?.split(' ')[1]; // Obtener el token del header Authorization
    if (!token) {
      return res.status(401).json({ error: 'No autorizado.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded.isAdmin) {
      return res.status(403).json({ error: 'Acceso denegado. No eres administrador.' });
    }

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