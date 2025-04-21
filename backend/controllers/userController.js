const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/user');
const Book = require('../models/book');
const { indexUser, updateUserInElastic } = require('../services/elasticUserService');
const populateUsers = require('../utils/populateUsers');


const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'El correo ya está registrado.' });
    }

    const user = new User({ name, email, password });
    const savedUser = await user.save();

    // Indexar el usuario en Elasticsearch
    await indexUser(savedUser);

    res.status(201).json({ message: 'Usuario registrado con éxito.' });
  } catch (err) {
    console.error('❌ Error registrando usuario:', err.message);
    res.status(500).json({ error: 'Error registrando usuario.' });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Credenciales inválidas.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Credenciales inválidas.' });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(200).json({ token });
  } catch (err) {
    console.error('❌ Error en login:', err.message);
    res.status(500).json({ error: 'Error en login.' });
  }
};

const addPurchasedBook = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No autorizado.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    const { bookId } = req.body;

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ error: 'Libro no encontrado.' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }

    const alreadyPurchased = user.purchasedBooks.some(
        (purchasedBook) => purchasedBook._id.toString() === bookId
      );
      if (alreadyPurchased) {
        return res.status(400).json({ error: 'El libro ya ha sido comprado por este usuario.' });
      }

    user.purchasedBooks.push(bookId);
    const savedUser = await user.save();

    // Actualizar el índice de Elasticsearch
    await updateUserInElastic(savedUser);

    res.status(200).json({ message: 'Libro comprado con éxito.', purchasedBooks: user.purchasedBooks });
  } catch (err) {
    console.error('❌ Error comprando libro:', err.message);
    res.status(500).json({ error: 'Error comprando libro.' });
  }
};

const populateUsersController = async (req, res) => {
  try {
    const { shouldDelete } = req.body;
    await populateUsers(shouldDelete);
    res.status(200).json({ message: 'Usuarios creados y poblados con éxito.' });
  } catch (err) {
    console.error('❌ Error poblando usuarios:', err.message);
    res.status(500).json({ error: 'Error poblando usuarios.' });
  }
};

module.exports = {
  registerUser,
  loginUser,
  addPurchasedBook,
  populateUsersController,
};