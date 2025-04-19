const express = require('express');
const { syncElasticWithMongo } = require('../controllers/elasticController');
const router = express.Router();

router.post('/sync-elastic', syncElasticWithMongo);

module.exports = router;