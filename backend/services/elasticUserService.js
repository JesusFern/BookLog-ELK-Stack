const esClient = require('../utils/elasticsearchClient');

const createUsersIndex = async () => {
  try {
    const indexExists = await esClient.indices.exists({ index: 'users' });

    if (indexExists) {
      console.log('ℹEl índice "users" ya existe. Eliminando documentos existentes...');
      await esClient.deleteByQuery({
        index: 'users',
        query: {
          match_all: {},
        },
      });
      console.log('Documentos existentes eliminados del índice "users".');
    } else {
      console.log('ℹEl índice "users" no existe. Creándolo...');
      await esClient.indices.create({
        index: 'users',
        mappings: {
          properties: {
            name: { type: 'text' },
            email: { type: 'keyword' }, // Usamos keyword para búsquedas exactas
            purchasedBooks: {
              type: 'nested', // Relación con libros como documentos anidados
              properties: {
                bookId: { type: 'keyword' },
                title: { type: 'text' },
              },
            },
            createdAt: { type: 'date' },
          },
        },
      });
      console.log('Índice "users" creado en Elasticsearch.');
    }
  } catch (err) {
    console.error('❌ Error creando el índice "users":', err.message);
    throw err;
  }
};

const indexUser = async (user) => {
  try {
    await esClient.index({
      index: 'users',
      id: user._id.toString(),
      document: {
        name: user.name,
        email: user.email,
        purchasedBooks: user.purchasedBooks.map((book) => ({
          bookId: book._id.toString(),
          title: book.title,
        })),
        createdAt: user.createdAt,
      },
    });
    console.log(`👤 Usuario "${user.name}" indexado en Elasticsearch.`);
  } catch (err) {
    console.error('❌ Error al indexar el usuario en Elasticsearch:', err.message);
    throw err;
  }
};

const bulkIndexUsers = async (users) => {
  try {
    const bulkOperations = users.flatMap((user) => [
      { index: { _index: 'users', _id: user._id.toString() } },
      {
        name: user.name,
        email: user.email,
        purchasedBooks: user.purchasedBooks.map((book) => ({
          bookId: book._id.toString(),
          title: book.title,
        })),
        createdAt: user.createdAt,
      },
    ]);

    const bulkResponse = await esClient.bulk({ refresh: true, body: bulkOperations });

    if (bulkResponse.errors) {
      const erroredDocuments = bulkResponse.items.filter((item) => item.index && item.index.error);
      console.error('❌ Errores durante la indexación en lote:', erroredDocuments);
      throw new Error('Errores durante la indexación en lote.');
    }

    console.log(`✅ ${users.length} usuarios indexados en Elasticsearch.`);
  } catch (err) {
    console.error('❌ Error durante la indexación en lote:', err.message);
    throw err;
  }
};

const updateUserInElastic = async (user) => {
    try {
      await esClient.update({
        index: 'users',
        id: user._id.toString(),
        doc: {
          purchasedBooks: user.purchasedBooks.map((book) => ({
            bookId: book._id.toString(),
            title: book.title,
          })),
        },
      });
      console.log(`🔄 Usuario "${user.name}" actualizado en Elasticsearch.`);
    } catch (err) {
      console.error('❌ Error actualizando el usuario en Elasticsearch:', err.message);
      throw err;
    }
  };

module.exports = {
  indexUser,
  bulkIndexUsers,
  updateUserInElastic,
  createUsersIndex
};