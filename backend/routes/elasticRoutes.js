const express = require('express');
const { syncElasticWithMongoBooks, syncElasticWithMongoUsers } = require('../controllers/elasticController');
const router = express.Router();

router.post('/sync-elastic-books', syncElasticWithMongoBooks);
router.post('/sync-elastic-users', syncElasticWithMongoUsers);

module.exports = router;