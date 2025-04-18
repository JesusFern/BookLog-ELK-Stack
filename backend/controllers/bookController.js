const Book = require('../models/book');

// Crear un libro
const createBook = async (req, res) => {
  try {
    const book = new Book(req.body); // Crear un nuevo libro con los datos del cuerpo de la solicitud
    await book.save(); // Guardar el libro en la base de datos
    res.status(201).json(book); // Responder con el libro creado
  } catch (err) {
    res.status(400).json({ error: err.message }); // Manejar errores
  }
};

module.exports = {
  createBook
};