const Book = require('../models/book');
const esClient = require('../utils/elasticsearchClient');

const syncElasticWithMongo = async (req, res) => {
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
          },
        },
      });
      console.log('Índice "books" creado en Elasticsearch.');
    }

    const books = await Book.find();

    const bulkOperations = books.flatMap((book) => [
      { index: { _index: 'books', _id: book._id.toString() } },
      {
        title: book.title,
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
        createdAt: book.createdAt,
      },
    ]);

    const bulkResponse = await esClient.bulk({ refresh: true, body: bulkOperations });

    if (bulkResponse.errors) {
      const erroredDocuments = bulkResponse.items.filter((item) => item.index && item.index.error);
      console.error('❌ Errores durante la sincronización:', erroredDocuments);
      return res.status(500).json({ message: 'Errores durante la sincronización con Elasticsearch.', errors: erroredDocuments });
    }

    res.status(200).json({ message: 'Índice "books" actualizado y sincronizado con MongoDB.' });
  } catch (err) {
    console.error('❌ Error sincronizando Elasticsearch con MongoDB:', err.message);
    res.status(500).json({ error: 'Error sincronizando Elasticsearch con MongoDB.' });
  }
};

module.exports = {
  syncElasticWithMongo,
};