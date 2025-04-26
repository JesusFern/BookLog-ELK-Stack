const Book = require('../models/book');

const getAvailableFormats = async () => {
  try {
    return await Book.distinct('format');
  } catch (err) {
    console.error('❌ Error obteniendo formatos disponibles:', err.message);
    throw err;
  }
};

module.exports = {
  getAvailableFormats
};