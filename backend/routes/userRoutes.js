const express = require('express');
const { registerUser, loginUser, addPurchasedBook, populateUsersController, userDetails } = require('../controllers/userController');

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/purchase', addPurchasedBook);
router.post('/populate', populateUsersController);
//router.post('/add', addToCart);
//router.post('/remove', removeFromCart);

router.get('/', userDetails)
//router.get('/cart', getCart);

module.exports = router;