const Book = require('../models/book');
const esClient = require('../utils/elasticsearchClient');
const importBooks = require('../services/importBooksService');
const { indexBook } = require('../services/elasticBookService');
const bookService = require('../services/bookService');
const { exec } = require('child_process');
const jwt = require('jsonwebtoken');

// Crear un libro
const createBook = async (req, res) => {
  try {
    const book = new Book(req.body);
    const savedBook = await book.save();

    // Indexar en Elasticsearch usando el servicio
    await indexBook(savedBook);

    res.status(201).json(savedBook);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const importBooksController = async (req, res) => {
  try {
    const { shouldDelete } = req.body; // Obtén el parámetro desde el cuerpo de la solicitud
    console.log(`📚 Iniciando importación de libros... (shouldDelete: ${shouldDelete})`);
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded.isAdmin) {
      return res.status(403).json({ error: 'Acceso denegado. No eres administrador.' });
    }
    
    await importBooks(shouldDelete); // Pasa el parámetro al servicio
    res.status(200).json({ message: 'Importación de libros completada con éxito.' });
  } catch (err) {
    console.error('❌ Error durante la importación de libros:', err.message);
    res.status(500).json({ error: 'Error durante la importación de libros.' });
  }
};

const multiMatchFuzzySearch = async (req, res) => {
  try {
    const { query, page = 1 } = req.query;
    const size = 20;

    const response = await esClient.search({
      index: 'books',
      from: (page - 1) * size,
      size: parseInt(size),
      _source: true,
      query: {
        bool: {
          should: [
            {
              multi_match: {
                query: query,
                fields: ['title^5', 'author^4', 'genre^3'],
                type: 'phrase',
                boost: 3
              }
            },
            {
              multi_match: {
                query: query,
                fields: ['title^4', 'author^3', 'genre^2', 'summary^1'],
                fuzziness: 'AUTO',
                type: 'best_fields',
                operator: 'and'
              }
            }
          ],
          minimum_should_match: 1
        }
      }
    });

    const total = response.hits.total.value;
    const totalPages = Math.ceil(total / size);

    const results = response.hits.hits.map((hit) => {
      return {
        _id: hit._id,
        ...hit._source
      };
    });

    res.status(200).json({
      total,
      page: parseInt(page),
      size: parseInt(size),
      totalPages,
      results
    });
  } catch (err) {
    console.error('❌ Error en búsqueda combinada multi_match y fuzzy:', err.message);
    res.status(500).json({ error: 'Error en búsqueda combinada multi_match y fuzzy.' });
  }
};


const getSuggestions = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query || query.trim() === '') {
      return res.status(200).json({ suggestions: [] });
    }

    const response = await esClient.search({
      index: 'books',
      body: {
        suggest: {
          title_suggestions: {
            prefix: query.toLowerCase(),
            completion: {
              field: 'title_suggest',
              size: 5,
              skip_duplicates: true
            }
          }
        },
        _source: ['title', 'author', '_id', 'coverImageUrl']
      }
    });

    const suggestions = response.suggest?.title_suggestions[0]?.options || [];
    
    const mappedSuggestions = suggestions.map(suggestion => ({
      _id: suggestion._id,
      title: suggestion._source.title,
      author: suggestion._source.author,
      coverImageUrl: suggestion._source.coverImageUrl
    }));

    res.status(200).json({ suggestions: mappedSuggestions });
  } catch (err) {
    console.error('❌ Error obteniendo sugerencias:', err.message);
    res.status(500).json({ error: 'Error obteniendo sugerencias.' });
  }
};

const getBooks = async (req, res) => {
  try {
    const { page = 1, size = 20 } = req.query;
    const from = (page - 1) * parseInt(size);
    
    const response = await esClient.search({
      index: 'books',
      from: parseInt(from),
      size: parseInt(size),
      _source: true,
      query: { match_all: {} }
    });
    
    const total = response.hits.total.value;
    const totalPages = Math.ceil(total / parseInt(size));
    
    const results = response.hits.hits.map(hit => ({
      _id: hit._id,
      ...hit._source
    }));

    const availableFormats = await bookService.getAvailableFormats();
    console.log('📚 Formatos disponibles:', availableFormats);

    res.status(200).json({
      total,
      page: parseInt(page),
      size: parseInt(size),
      totalPages,
      results,
      // Añadir facets con formatos
      facets: {
        formats: availableFormats.map(format => ({ 
          value: format, 
          count: 0
        }))
      }
    });
    
  } catch (err) {
    console.error('❌ Error obteniendo libros:', err.message);
    res.status(500).json({ error: 'Error obteniendo libros.' });
  }
};


const getBookById = async (req, res) => {
  try {
    const { id } = req.params;
    const book = await Book.findById(id);
    if (!book) {
      return res.status(404).json({ error: 'Libro no encontrado.' });
    }
    res.status(200).json(book);
  } catch (err) {
    console.error('❌ Error obteniendo libro por ID:', err.message);
    res.status(500).json({ error: 'Error obteniendo libro por ID.' });
  }
}

const getTopBooks = async (req, res) => {
  try {
    const response = await esClient.search({
      index: 'books',
      size: 8,
      sort: [
        { purchasedCount: { order: 'desc' } }
      ],
      _source: ['_id', 'title', 'author', 'purchasedCount', 'coverImageUrl', 'price', 'genre'],
    });

    const topBooks = response.hits.hits.map((hit) => ({
      _id: hit._id,
      ...hit._source
    }));

    res.status(200).json(topBooks);
  } catch (err) {
    console.error('❌ Error obteniendo los libros más populares:', err.message);
    res.status(500).json({ error: 'Error obteniendo los libros más populares.' });
  }
};

const getRelatedBooks = async (req, res) => {
  try {
    const { bookId } = req.params;

    const response = await esClient.search({
      index: 'books',
      query: {
        more_like_this: {
          fields: ['genre^3','author^2', 'summary'],
          like: [
            { _id: bookId }
          ],
          min_term_freq: 2,
          max_query_terms: 12
        }
      },
      size: 5
    });

    const relatedBooks = response.hits.hits.map((hit) => hit._source);

    res.status(200).json(relatedBooks);
  } catch (err) {
    console.error('❌ Error obteniendo libros relacionados:', err.message);
    res.status(500).json({ error: 'Error obteniendo libros relacionados.' });
  }
};

const searchWithFilters = async (req, res) => {
  try {
    const { query, genres, minPrice, maxPrice, formats, minYear, maxYear, page = 1 } = req.query;
    const size = 20;
    const from = (page - 1) * size;
    
    const esQuery = {
      bool: {
        must: [],
        filter: []
      }
    };
    
    if (query && query.trim()) {
      esQuery.bool.must.push({
        multi_match: {
          query: query.trim(),
          fields: ['title^5', 'author^4', 'genre^3'],
          operator: 'and'
        }
      });
    } else {
      esQuery.bool.must.push({ match_all: {} });
    }
    
    if (genres && genres.trim()) {
      esQuery.bool.filter.push({
        bool: {
          should: genres.split(',').map(g => ({
            match: {
              genre: {
                query: g.trim(),
                analyzer: 'standard'  // Esto asegura que la comparación es insensible a mayúsculas/minúsculas
              }
            }
          })),
          minimum_should_match: 1
        }
      });
    }
    
    if (minPrice?.trim() || maxPrice?.trim()) {
      const priceRange = {};
      if (minPrice?.trim()) priceRange.gte = parseFloat(minPrice);
      if (maxPrice?.trim()) priceRange.lte = parseFloat(maxPrice);
      esQuery.bool.filter.push({ range: { price: priceRange } });
    }
    
    if (formats && formats.trim()) {
      esQuery.bool.filter.push({
        terms: { format: formats.split(',').map(f => f.trim()) }
      });
    }
    
    if (minYear?.trim() || maxYear?.trim()) {
      const yearRange = {};
      if (minYear?.trim()) yearRange.gte = parseInt(minYear);
      if (maxYear?.trim()) yearRange.lte = parseInt(maxYear);
      esQuery.bool.filter.push({ range: { publishedYear: yearRange } });
    }
    
    // Ejecutar la búsqueda en Elasticsearch
    const response = await esClient.search({
      index: 'books',
      from,
      size,
      query: esQuery,
      _source: true
    });
    
    // Obtener resultados
    const results = response.hits.hits.map(hit => ({
      _id: hit._id,
      ...hit._source
    }));
    
    // Calcular paginación
    const total = response.hits.total.value;
    const totalPages = Math.ceil(total / size);
    
    // Obtener formatos disponibles desde el servicio
    const availableFormats = await bookService.getAvailableFormats();
    
    // Devolver la respuesta
    res.status(200).json({
      total,
      page: parseInt(page),
      size,
      totalPages,
      results,
      facets: {
        formats: availableFormats.map(format => ({ 
          value: format, 
          count: 0
        }))
      }
    });
    
  } catch (err) {
    console.error('❌ Error en búsqueda con filtros:', err.message);
    res.status(500).json({ error: 'Error en búsqueda con filtros.' });
  }
};


const getTotalBooks = async (req, res) => {
  try {
    const totalBooks = await Book.countDocuments();
    console.log('📚 Total de libros:', totalBooks);
    res.status(200).json({ totalBooks });
  } catch (err) {
    console.error('❌ Error obteniendo el total de libros:', err.message);
    res.status(500).json({ error: 'Error obteniendo el total de libros.' });
  }
};


const simulateBuy = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]; // Obtener el token del header Authorization
    if (!token) {
      return res.status(401).json({ error: 'No autorizado.' });
    }

    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded.isAdmin) {
      return res.status(403).json({ error: 'Acceso denegado. No eres administrador.' });
    }

    exec('node ./scripts/simulateBuy.js', (error, stdout, stderr) => {
      if (error) {
        console.error('❌ Error ejecutando simulateBuy.js:', error.message);
        return res.status(500).json({ error: 'Error ejecutando el script.' });
      }

      if (stderr) {
        console.error('⚠️ stderr:', stderr);
      }

      console.log('✅ Script ejecutado correctamente:', stdout);
      res.status(200).json({ message: 'Simulación de compra completada.', output: stdout });
    });
  
  } catch (err) {
    console.error('❌ Error simulando compra:', err.message);
    res.status(500).json({ error: 'Error simulando compra.' });
  }
}

module.exports = {
  createBook,
  importBooksController,
  multiMatchFuzzySearch,
  getBooks,
  getBookById,
  getTopBooks,
  getRelatedBooks,
  getSuggestions,
  searchWithFilters,
  getTotalBooks,
  simulateBuy,
};