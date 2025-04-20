require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const bookRoutes = require('./routes/bookRoutes');
const elasticRoutes = require('./routes/elasticRoutes');
const userRoutes = require('./routes/userRoutes');
const winston = require('winston');
const Transport = require('winston-transport');
const net = require('net');

const app = express();
const PORT = process.env.APP_PORT || 3000;

class TCPTransport extends Transport {
  constructor(options = {}) {
    super(options);
    this.name = 'tcp';
    this.host = options.host || 'localhost';
    this.port = options.port || 5044;
    this.silent = options.silent || false;
  }

  log(info, callback) {
    if (this.silent) {
      return callback(null, true);
    }

    const socket = new net.Socket();
    socket.connect(this.port, this.host, () => {
      const message = JSON.stringify(info) + '\n';
      socket.write(message);
      socket.end();
    });

    socket.on('error', (err) => {
      console.error('Error al enviar log a Logstash:', err);
    });

    socket.on('close', () => {
      callback(null, true);
    });
  }
}


// Logger para Elasticsearch
const logger = winston.createLogger({
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new TCPTransport({
      host: 'localhost',
      port: 5044
    })
  ]
});
// Middleware para registrar solicitudes HTTP
app.use(bodyParser.json());
app.use((req, res, next) => {
  const start = Date.now();
  
  // Captura el final de la respuesta
  res.on('finish', () => {
    logger.info({
      method: req.method,
      url: req.url,
      path: req.path,
      query: req.query,
      params: req.params,
      ip: req.ip,
      user_agent: req.get('user-agent'),
      status_code: res.statusCode,
      response_time: Date.now() - start
    });
  });
  
  next();
});

// Conexión a MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Conectado a MongoDB'))
  .catch(err => console.error('Error al conectar a MongoDB:', err));
  
// Rutas
app.use('/api/books', bookRoutes);
app.use('/api/elastic-books', elasticRoutes);
app.use('/api/users', userRoutes);


// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});