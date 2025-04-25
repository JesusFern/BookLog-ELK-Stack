const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/user');
const Book = require('../models/book');
const { indexUser, updateUserInElastic } = require('../services/elasticUserService');
const { updateBookInElastic } = require('../services/elasticBookService');
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

    // Actualizar los índices de Elasticsearch
    await updateUserInElastic(savedUser);
    book.purchasedCount = book.purchasedCount ? book.purchasedCount + 1 : 1;
    await book.save();
    console.log(book.purchasedCount)
    await updateBookInElastic(bookId);

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


const userDetails = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]; // Obtener el token del header Authorization
    if (!token) {
      return res.status(401).json({ error: 'No autorizado.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }

    res.status(200).json({ user });
  } catch (err) {
    console.error('❌ Error obteniendo detalles del usuario:', err.message);
    res.status(500).json({ error: 'Error obteniendo detalles del usuario.' });
  }
};


const getCart = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]; // Obtener el token del header Authorization
    if (!token) {
      return res.status(401).json({ error: 'No autorizado.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    const user = await User.findById(userId).populate('cart');
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }

    res.status(200).json({ cart: user.cart });
  } catch (err) {
    console.error('❌ Error obteniendo el carrito:', err.message);
    res.status(500).json({ error: 'Error obteniendo el carrito.' });
  }
}


const addItemCart = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    console.log('🔐 Token recibido:', token);
    if (!token) {
      return res.status(401).json({ error: 'No autorizado.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('✅ Token decodificado:', decoded);

    const userId = decoded.userId;
    const { bookId } = req.body;

    console.log('📘 Book ID:', bookId);
    const book = await Book.findById(bookId);
    if (!book) {
      console.log('❌ Libro no encontrado');
      return res.status(404).json({ error: 'Libro no encontrado.' });
    }

    const user = await User.findById(userId);
    if (!user) {
      console.log('❌ Usuario no encontrado');
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }

    if (user.cart.includes(bookId)) {
      console.log('❌ El libro ya está en el carrito');
      return res.status(400).json({ error: 'El libro ya está en el carrito.' });
    }

    user.cart.push(bookId);
    const savedUser = await user.save();

    try {
      await updateUserInElastic(savedUser);
    } catch (elasticErr) {
      console.warn('⚠️ Error actualizando en ElasticSearch (ignorado):', elasticErr.message);
    }

    console.log('🛒 Libro añadido al carrito:', savedUser.cart);
    res.status(200).json({ message: 'Libro añadido al carrito con éxito.', cart: user.cart });

  } catch (err) {
    console.error('❌ Error añadiendo libro al carrito:', err.message);
    res.status(500).json({ error: 'Error añadiendo libro al carrito.' });
  }
}

module.exports = {
  registerUser,
  loginUser,
  addPurchasedBook,
  populateUsersController,
  userDetails,
  getCart,
  addItemCart,
};