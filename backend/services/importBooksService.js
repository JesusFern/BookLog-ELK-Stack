require('dotenv').config();
const fs = require('fs');
const csv = require('csv-parser');
const { faker } = require('@faker-js/faker');
const esClient = require('../utils/elasticsearchClient');
const Book = require('../models/book');

// Idiomas válidos
const LANGUAGES = ['Español', 'Inglés', 'Francés', 'Italiano', 'Japonés'];
const FORMATS = ['PDF', 'EPUB', 'MOBI'];

// Función para generar formatos aleatorios
const getRandomFormats = () => {
  const shuffled = FORMATS.toSorted(() => 0.5 - Math.random());
  const count = Math.floor(Math.random() * 3) + 1;
  return shuffled.slice(0, count);
};

// Función para generar URLs falsas de descarga
const generateDownloadUrls = (formats) => {
  const urls = {};
  formats.forEach(format => {
    urls[format] = faker.internet.url();
  });
  return urls;
};

// Función para eliminar el índice en Elasticsearch
const deleteIndex = async () => {
  try {
    const exists = await esClient.indices.exists({ index: process.env.ELASTIC_INDEX });
    if (exists) {
      await esClient.indices.delete({ index: process.env.ELASTIC_INDEX });
      console.log(`🗑️ Índice "${process.env.ELASTIC_INDEX}" eliminado.`);
    } else {
      console.log(`ℹ️ Índice "${process.env.ELASTIC_INDEX}" no existe, no se necesita eliminar.`);
    }
  } catch (err) {
    console.error('❌ Error eliminando el índice:', err.message);
  }
};

const importBooks = async (shouldDelete) => {
  if (shouldDelete) {
    console.log('🗑️ Eliminando datos existentes...');

    // Elimina el índice en Elasticsearch si existe
    await deleteIndex();

    // Elimina todos los documentos de la colección `books` en MongoDB
    try {
      await Book.deleteMany({});
      console.log('🗑️ Todos los documentos de la colección "books" han sido eliminados.');
    } catch (err) {
      console.error('❌ Error eliminando documentos de la colección "books":', err.message);
      throw err;
    }
  } else {
    console.log('ℹ️ No se eliminarán datos existentes.');
  }

  return new Promise((resolve, reject) => {
    const path = './data/books.csv';

    if (!fs.existsSync(path)) {
      return reject(new Error(`❌ El archivo ${path} no existe. Asegúrate de que esté en la ubicación correcta.`));
    }

    let totalImported = 0; // Contador para libros importados

    const promises = []; // Almacena las promesas de las operaciones asincrónicas

    fs.createReadStream(path)
      .pipe(csv({ separator: ';' }))
      .on('data', (row) => {

        const promise = (async () => {
          try {
            const formats = getRandomFormats();
            const bookData = {
              title: row.title || 'Sin título',
              author: row.authors || 'Desconocido / No indicado',
              genre: row.categories || 'Ficción',
              summary: row.description || '',
              language: faker.helpers.arrayElement(LANGUAGES),
              price: parseFloat((Math.random() * 15 + 5).toFixed(2)), // entre 5 y 20 euros
              format: formats,
              coverImageUrl: row.thumbnail,
              downloadFileUrls: generateDownloadUrls(formats),
              publishedYear: parseInt(row.published_year) || null,
              numPages: parseInt(row.num_pages) || faker.number.int({ min: 100, max: 800 }),
            };

            const mongoBook = new Book(bookData);
            const savedBook = await mongoBook.save();

            // Indexar en Elasticsearch
            await esClient.index({
              index: process.env.ELASTIC_INDEX,
              id: savedBook._id.toString(),
              document: {
                title: savedBook.title,
                author: savedBook.author,
                genre: savedBook.genre,
                summary: savedBook.summary,
                language: savedBook.language,
                price: savedBook.price,
                format: savedBook.format,
                coverImageUrl: savedBook.coverImageUrl,
                publishedYear: savedBook.publishedYear,
                numPages: savedBook.numPages,
                createdAt: savedBook.createdAt,
              },
            });

            totalImported++; // Incrementa el contador de libros importados
          } catch (err) {
            console.error('❌ Error procesando libro:', err.message);
          }
        })();

        promises.push(promise); // Agrega la promesa a la lista
      })
      .on('end', async () => {
        try {
          // Espera a que todas las promesas se resuelvan
          await Promise.all(promises);

          console.log(`✅ Total de libros importados e indexados: ${totalImported}`);
          resolve();
        } catch (err) {
          console.error('❌ Error durante la importación:', err.message);
          reject(err);
        }
      })
      .on('error', (err) => {
        console.error('❌ Error leyendo el archivo CSV:', err.message);
        reject(err);
      });
  });
};

module.exports = importBooks;