const express = require('express');
const router = express.Router();
const {
  createOrder,
  verifyPayment,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
} = require('../controllers/orderController');
const { protect, admin } = require('../middleware/authMiddleware');

router.use(protect); // All order routes require login

router.post('/', createOrder);
router.post('/verify', verifyPayment);
router.get('/my-orders', getMyOrders);

// Admin-only order routes
router.get('/all', admin, getAllOrders);
router.put('/:id/status', admin, updateOrderStatus);

module.exports = router;
