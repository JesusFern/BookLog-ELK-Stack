const esClient = require('../utils/elasticsearchClient');
const Book = require('../models/book');

// Función para indexar un libro en Elasticsearch
const indexBook = async (book) => {
  try {
    await esClient.index({
      index: 'books',
      id: book._id.toString(),
      document: {
        title: book.title,
        title_suggest: {
          input: [book.title],
          weight: 10,
        },
        author: book.author,
        genre: book.genre,
        summary: book.summary,
        language: book.language,
        price: book.price,
        format: book.format,
        coverImageUrl: book.coverImageUrl,
        downloadFileUrls: book.downloadFileUrls,
        publishedYear: book.publishedYear,
        numPages: book.numPages,
        purchasedCount: book.purchasedCount, 
        createdAt: book.createdAt,
      },
    });
    console.log(`📘 Libro "${book.title}" indexado en Elasticsearch.`);
  } catch (err) {
    console.error('❌ Error al indexar el libro en Elasticsearch:', err.message);
    throw err;
  }
};

// Función para indexar múltiples libros en un solo lote
const bulkIndexBooks = async (books) => {
  try {
    const bulkOperations = books.flatMap((book) => [
      { index: { _index: 'books', _id: book._id.toString() } },
      {
        title: book.title,
        title_suggest: {
          input: [book.title],
          weight: 10,
        },
        author: book.author,
        genre: book.genre,
        summary: book.summary,
        language: book.language,
        price: book.price,
        format: book.format,
        coverImageUrl: book.coverImageUrl,
        downloadFileUrls: book.downloadFileUrls,
        publishedYear: book.publishedYear,
        numPages: book.numPages,
        purchasedCount: book.purchasedCount,
        createdAt: book.createdAt,
      },
    ]);

    const bulkResponse = await esClient.bulk({ refresh: true, body: bulkOperations });

    if (bulkResponse.errors) {
      const erroredDocuments = bulkResponse.items.filter((item) => item.index && item.index.error);
      console.error('❌ Errores durante la indexación en lote:', erroredDocuments);
      throw new Error('Errores durante la indexación en lote.');
    }

    console.log(`✅ ${books.length} libros indexados en Elasticsearch.`);
  } catch (err) {
    console.error('❌ Error durante la indexación en lote:', err.message);
    throw err;
  }
};

const createBooksIndex = async () => {
  try {
    const indexExists = await esClient.indices.exists({ index: 'books' });

    if (indexExists) {
      console.log('ℹEl índice "books" ya existe. Eliminando documentos existentes...');
      await esClient.deleteByQuery({
        index: 'books',
        query: {
          match_all: {},
        },
      });
      console.log('Documentos existentes eliminados del índice "books".');
    } else {
      console.log('ℹEl índice "books" no existe. Creándolo...');
      await esClient.indices.create({
        index: 'books',
        mappings: {
          properties: {
            title: { type: 'text' },
            title_suggest: { type: 'completion' },
            author: { type: 'text' },
            genre: { type: 'text' },
            summary: { type: 'text' },
            language: { type: 'keyword' },
            price: { type: 'float' },
            format: { type: 'keyword' },
            coverImageUrl: { type: 'text' },
            downloadFileUrls: {
              properties: {
                PDF: { type: 'text' },
                EPUB: { type: 'text' },
                MOBI: { type: 'text' },
              },
            },
            publishedYear: { type: 'integer' },
            numPages: { type: 'integer' },
            createdAt: { type: 'date' },
            purchasedCount: { type: 'integer'},
          },
        },
      });
      console.log('Índice "books" creado en Elasticsearch.');
    }
  } catch (err) {
    console.error('❌ Error creando el índice "books":', err.message);
    throw err;
  }
};

const updateBookInElastic = async (bookId) => {
  try {
    // Obtener el libro actualizado desde MongoDB
    const updatedBook = await Book.findById(bookId);

    if (!updatedBook) {
      throw new Error(`Libro con ID ${bookId} no encontrado en MongoDB.`);
    }

    console.log(`🔄 Actualizando libro ${bookId} en Elasticsearch con purchasedCount:`, updatedBook.purchasedCount);

    // Actualizar específicamente el campo purchasedCount
    await esClient.update({
      index: 'books',
      id: bookId,
      doc: {
        purchasedCount: updatedBook.purchasedCount
      },
      refresh: true // Forzar actualización inmediata
    });

    console.log(`✅ Campo purchasedCount actualizado para el libro ${bookId} en Elasticsearch.`);

    // Verificar la actualización
    const esBook = await esClient.get({
      index: 'books',
      id: bookId
    });
    
    console.log(`📊 Valor actual de purchasedCount en Elasticsearch para libro ${bookId}:`, 
      esBook._source.purchasedCount);

  } catch (err) {
    console.error(`❌ Error actualizando el libro en Elasticsearch con ID ${bookId}:`, err.message);
    throw err;
  }
};
module.exports = {
  indexBook,
  createBooksIndex,
  bulkIndexBooks,
  updateBookInElastic
};