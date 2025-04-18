const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const bookRoutes = require('./routes/bookRoutes');
const winston = require('winston');
const { Client } = require('@elastic/elasticsearch');

const app = express();
const PORT = 3000;

// Crear índice para libros en Elasticsearch
const createBookIndex = async () => {
    try {
      const exists = await elasticClient.indices.exists({ index: 'books' });
      if (!exists) {
        await elasticClient.indices.create({
          index: 'books',
          body: {
            mappings: {
              properties: {
                title: { type: 'text' },
                author: { type: 'text' },
                genre: { type: 'keyword' },
                summary: { type: 'text' },
                createdAt: { type: 'date' }
              }
            }
          }
        });
        console.log('Índice "books" creado en Elasticsearch');
      }
    } catch (err) {
      console.error('Error al crear el índice de libros:', err);
    }
  };
  
 //   createBookIndex();

// Logger para Elasticsearch
const logger = winston.createLogger({
  transports: [
    new winston.transports.Http({
      host: 'localhost', // Usa 'logstash' si estás en Docker Compose, o 'localhost' si estás fuera de Docker
      port: 5044,
      path: '/',
      format: winston.format.json()
    })
  ]
});

// Middleware para registrar solicitudes HTTP
app.use(bodyParser.json());
app.use((req, res, next) => {
  logger.info({
    method: req.method,
    url: req.url,
    timestamp: new Date().toISOString()
  });
  next();
});

// Conexión a MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/bookdb')
  .then(() => console.log('Conectado a MongoDB'))
  .catch(err => console.error('Error al conectar a MongoDB:', err));
// Rutas
app.use('/api/books', bookRoutes);

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});