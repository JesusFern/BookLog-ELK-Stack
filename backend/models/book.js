const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true, unique: true },
  author: { type: String, required: true },
  genre: { type: String, required: true },
  summary: { type: String },
  language: { 
    type: String, 
    enum: ['Español', 'Inglés', 'Francés', 'Italiano', 'Japonés'], 
    default: 'Español' 
  },
  price: { type: Number, required: true },
  format: [{ type: String, enum: ['PDF', 'EPUB', 'MOBI'] }],
  coverImageUrl: { type: String },
  downloadFileUrls: {
    PDF: { type: String },
    EPUB: { type: String },
    MOBI: { type: String }
  },
  publishedYear: { type: Number },
  purchasedCount: { type: Number, default: 0 }, 
  numPages: { type: Number },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Book', bookSchema);
