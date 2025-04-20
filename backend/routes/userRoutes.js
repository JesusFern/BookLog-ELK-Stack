const express = require('express');
const { registerUser, loginUser, addPurchasedBook } = require('../controllers/userController');

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);

router.post('/purchase', addPurchasedBook);

module.exports = router;