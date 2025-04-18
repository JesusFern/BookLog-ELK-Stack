const { Client } = require('@elastic/elasticsearch');

const client = new Client({
  node: 'http://localhost:9200' // Cambia si tu instancia está en otro host/puerto
});

module.exports = client;
