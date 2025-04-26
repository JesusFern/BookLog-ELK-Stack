const express = require('express');
const { registerUser, loginUser, addPurchasedBook, populateUsersController, userDetails, getCart, addItemCart, getTotalUsers } = require('../controllers/userController');

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/purchase', addPurchasedBook);
router.post('/populate', populateUsersController);
router.post('/cart/add', addItemCart);
//router.post('/remove', removeFromCart);

router.get('/', userDetails)
router.get('/cart', getCart);
router.get('/total-users', getTotalUsers);

module.exports = router;