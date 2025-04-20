const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/user');
const Book = require('../models/book');

const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'El correo ya está registrado.' });
    }

    const user = new User({ name, email, password });
    await user.save();

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

    // Verificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    const { bookId } = req.body;

    // Verificar si el libro existe
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ error: 'Libro no encontrado.' });
    }

    // Agregar el libro a los libros comprados del usuario
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }

    user.purchasedBooks.push(bookId);
    await user.save();

    res.status(200).json({ message: 'Libro comprado con éxito.', purchasedBooks: user.purchasedBooks });
  } catch (err) {
    console.error('❌ Error comprando libro:', err.message);
    res.status(500).json({ error: 'Error comprando libro.' });
  }
};

module.exports = {
  registerUser,
  loginUser,
  addPurchasedBook,
};