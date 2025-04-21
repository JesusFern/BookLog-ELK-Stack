const express = require('express');
const { registerUser, loginUser, addPurchasedBook, populateUsersController } = require('../controllers/userController');

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);

router.post('/purchase', addPurchasedBook);


router.post('/populate', populateUsersController);

module.exports = router;