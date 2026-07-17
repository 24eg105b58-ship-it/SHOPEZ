const express = require('express');
const router = express.Router();
const {
  getCart,
  addToCart,
  updateCartQuantity,
  removeFromCart,
  clearCart,
} = require('../controllers/cartController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect); // Protect all cart routes

router.get('/', getCart);
router.post('/add', addToCart);
router.put('/update', updateCartQuantity);
router.delete('/', clearCart);
router.delete('/:productId', removeFromCart);

module.exports = router;
