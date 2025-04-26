const Book = require('../models/book');
const esClient = require('../utils/elasticsearchClient');
const importBooks = require('../services/importBooksService');
const { indexBook } = require('../services/elasticBookService');

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

    await importBooks(shouldDelete); // Pasa el parámetro al servicio
    res.status(200).json({ message: 'Importación de libros completada con éxito.' });
  } catch (err) {
    console.error('❌ Error durante la importación de libros:', err.message);
    res.status(500).json({ error: 'Error durante la importación de libros.' });
  }
};

const searchByTitle = async (req, res) => {
  try {
    const { title } = req.query;
    const response = await esClient.search({
      index: 'books',
      query: {
        match: {
          title: title,
        },
      },
    });

    res.status(200).json(response.hits.hits.map(hit => hit._source));
  } catch (err) {
    console.error('❌ Error buscando por título:', err.message);
    res.status(500).json({ error: 'Error buscando por título.' });
  }
};

const searchByAuthor = async (req, res) => {
  try {
    const { author } = req.query;
    const response = await esClient.search({
      index: 'books',
      query: {
        match: {
          author: author, // Busca coincidencias en el campo "author"
        },
      },
    });

    res.status(200).json(response.hits.hits.map(hit => hit._source));
  } catch (err) {
    console.error('❌ Error buscando por autor:', err.message);
    res.status(500).json({ error: 'Error buscando por autor.' });
  }
};

const searchByGenre = async (req, res) => {
  try {
    const { genre } = req.query;
    const response = await esClient.search({
      index: 'books',
      query: {
        match: {
          genre: genre, // Busca coincidencias en el campo "genre"
        },
      },
    });

    res.status(200).json(response.hits.hits.map(hit => hit._source));
  } catch (err) {
    console.error('❌ Error buscando por género:', err.message);
    res.status(500).json({ error: 'Error buscando por género.' });
  }
};

const searchByPriceRange = async (req, res) => {
  try {
    const { minPrice, maxPrice } = req.query;
    const response = await esClient.search({
      index: 'books',
      query: {
        range: {
          price: {
            gte: parseFloat(minPrice), // Precio mínimo
            lte: parseFloat(maxPrice), // Precio máximo
          },
        },
      },
    });

    res.status(200).json(response.hits.hits.map(hit => hit._source));
  } catch (err) {
    console.error('❌ Error buscando por rango de precios:', err.message);
    res.status(500).json({ error: 'Error buscando por rango de precios.' });
  }
};

const multiMatchFuzzySearch = async (req, res) => {
  try {
    const { query, page = 1 } = req.query;
    const size = 100;

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

const fuzzySearchByTitle = async (req, res) => {
  try {
    const { title } = req.query;
    const response = await esClient.search({
      index: 'books',
      query: {
        match: {
          title: {
            query: title,
            fuzziness: "AUTO", // Permite errores tipográficos
          },
        },
      },
    });

    res.status(200).json(response.hits.hits.map(hit => hit._source));
  } catch (err) {
    console.error('❌ Error en búsqueda difusa por título:', err.message);
    res.status(500).json({ error: 'Error en búsqueda difusa por título.' });
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
    const books = await Book.find();
    res.status(200).json(books);
  } catch (err) {
    console.error('❌ Error obteniendo libros:', err.message);
    res.status(500).json({ error: 'Error obteniendo libros.' });
  }
}


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
      size: 3,
      sort: [
        { purchasedCount: { order: 'desc' } }
      ],
      _source: ['title', 'author', 'purchasedCount'],
    });

    const topBooks = response.hits.hits.map((hit) => hit._source);

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

module.exports = {
  createBook,
  importBooksController,
  searchByTitle,
  searchByAuthor,
  searchByGenre,
  searchByPriceRange,
  multiMatchFuzzySearch,
  fuzzySearchByTitle,
  getBooks,
  getBookById,
  getTopBooks,
  getRelatedBooks,
  getSuggestions
};