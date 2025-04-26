const mongoose = require('mongoose');
const axios = require('axios');
const User = require('../models/user');
const Book = require('../models/book');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const simulateBuy = async () => {
  try {
    console.log('📚 Simulando compras de libros...');

    const users = await User.find();
    const books = await Book.find();

    if (users.length === 0 || books.length === 0) {
      console.log('❌ No hay usuarios o libros disponibles en la base de datos.');
      return;
    }

    for (let i = 0; i < 50; i++) {
      const randomUser = users[Math.floor(Math.random() * users.length)];

      const token = jwt.sign({ userId: randomUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

      const availableBooks = books.filter(
        (book) => !randomUser.purchasedBooks.includes(book._id.toString())
      );

      if (availableBooks.length === 0) {
        console.log(`ℹ️ El usuario ${randomUser.name} ya compró todos los libros.`);
        continue;
      }

      const randomBook = availableBooks[Math.floor(Math.random() * availableBooks.length)];

      try {
        await axios.post(
          'http://localhost:3000/api/users/purchase',
          { bookId: randomBook._id },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log(`✅ Usuario ${randomUser.name} compró el libro "${randomBook.title}".`);
      } catch (err) {
        console.error(`❌ Error en la compra del libro para ${randomUser.name}:`, err.response?.data || err.message);
      }
    }

    console.log('✅ Simulación de compras completada.');
  } catch (err) {
    console.error('❌ Error simulando compras:', err.message);
  } finally {
    mongoose.connection.close();
  }
};

// Conectar a MongoDB antes de ejecutar la simulación
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log('✅ Conexión a MongoDB establecida.');
    simulateBuy();
  })
  .catch((err) => {
    console.error('❌ Error conectando a MongoDB:', err.message);
  });