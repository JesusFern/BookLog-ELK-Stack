const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  genre: { type: String, required: true },
  summary: { type: String },
  language: { type: String, default: 'Español' },
  price: { type: Number, required: true },
  format: [{ type: String, enum: ['PDF', 'EPUB', 'MOBI'] }], // formatos disponibles
  coverImageUrl: { type: String }, // imagen de portada (url)
  downloadFileUrls: {
    PDF: { type: String },
    EPUB: { type: String },
    MOBI: { type: String }
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Book', bookSchema);