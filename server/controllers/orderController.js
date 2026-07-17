const Order = require('../models/Order');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const { createRazorpayOrder, verifyRazorpaySignature } = require('../config/razorpay');
const { sendEmail } = require('../config/nodemailer');

// @desc    Create new order & initialize payment
// @route   POST /api/orders
// @access  Private
const createOrder = async (req, res) => {
  try {
    const { products, shippingAddress } = req.body;

    if (!products || products.length === 0) {
      return res.status(400).json({ success: false, message: 'No products in order' });
    }

    if (!shippingAddress || !shippingAddress.address || !shippingAddress.city || !shippingAddress.postalCode || !shippingAddress.phone) {
      return res.status(400).json({ success: false, message: 'Please provide a complete shipping address' });
    }

    // Verify stock and compute total price
    let totalAmount = 0;
    const orderItems = [];

    for (const item of products) {
      const dbProduct = await Product.findById(item.productId);
      if (!dbProduct) {
        return res.status(404).json({ success: false, message: `Product ${item.productId} not found` });
      }

      if (dbProduct.stock < item.quantity) {
        return res.status(400).json({ 
          success: false, 
          message: `Insufficient stock for product ${dbProduct.name}. Available: ${dbProduct.stock}, Requested: ${item.quantity}` 
        });
      }

      totalAmount += dbProduct.price * item.quantity;
      orderItems.push({
        productId: item.productId,
        quantity: item.quantity,
        price: dbProduct.price,
      });
    }

    // Generate Razorpay Order (Mocked or Real based on config)
    const receiptId = `receipt_${Date.now()}`;
    const paymentOrder = await createRazorpayOrder(totalAmount, receiptId);

    // Create Order in DB
    const order = new Order({
      userId: req.user._id,
      products: orderItems,
      totalAmount,
      shippingAddress,
      status: 'Pending',
      paymentDetails: {
        orderId: paymentOrder.id,
      },
    });

    const savedOrder = await order.save();

    res.status(201).json({
      success: true,
      order: savedOrder,
      paymentOrder, // details for frontend Razorpay SDK or mock UI
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Verify payment signature and finalize order
// @route   POST /api/orders/verify
// @access  Private
const verifyPayment = async (req, res) => {
  try {
    const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const isValid = verifyRazorpaySignature(razorpayOrderId, razorpayPaymentId, razorpaySignature);

    if (isValid) {
      // 1. Mark Order as Paid
      order.status = 'Paid';
      order.paymentDetails.paymentId = razorpayPaymentId;
      order.paymentDetails.signature = razorpaySignature;
      await order.save();

      // 2. Adjust Product Stocks
      for (const item of order.products) {
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { stock: -item.quantity },
        });
      }

      // 3. Clear Cart
      await Cart.findOneAndUpdate({ userId: req.user._id }, { products: [] });

      // 4. Send Email Notification
      const populatedOrder = await Order.findById(order._id)
        .populate('userId', 'name email')
        .populate('products.productId', 'name');

      const itemsText = populatedOrder.products.map(
        (item) => `- ${item.productId.name} x ${item.quantity} (₹${item.price} each)`
      ).join('\n');

      sendEmail({
        to: req.user.email,
        subject: `SHOPEZ - Order Confirmed! (ID: ${order._id})`,
        text: `Hi ${req.user.name},\n\nThank you for shopping with SHOPEZ!\n\nYour order has been placed successfully and marked as Paid.\n\nOrder Details:\nOrder ID: ${order._id}\nTotal Amount: ₹${order.totalAmount}\n\nItems:\n${itemsText}\n\nShipping Address:\n${order.shippingAddress.address}, ${order.shippingAddress.city} - ${order.shippingAddress.postalCode}\nPhone: ${order.shippingAddress.phone}\n\nWe will notify you once your package ships.\n\nBest regards,\nSHOPEZ Team`,
        html: `<h3>Hi ${req.user.name},</h3>
               <p>Thank you for shopping with <strong>SHOPEZ</strong>!</p>
               <p>Your order has been placed successfully and marked as Paid.</p>
               <h4>Order Details:</h4>
               <p><strong>Order ID:</strong> ${order._id}<br/><strong>Total Amount:</strong> ₹${order.totalAmount}</p>
               <h4>Items:</h4>
               <ul>
                 ${populatedOrder.products.map(item => `<li>${item.productId.name} x ${item.quantity} (₹${item.price} each)</li>`).join('')}
               </ul>
               <h4>Shipping Address:</h4>
               <p>${order.shippingAddress.address}, ${order.shippingAddress.city} - ${order.shippingAddress.postalCode}<br/>Phone: ${order.shippingAddress.phone}</p>
               <br/><p>Best regards,<br/>SHOPEZ Team</p>`
      }).catch(err => console.error('Order email sending failed:', err));

      res.json({ success: true, message: 'Payment verified successfully', order });
    } else {
      // Payment verification failed
      order.status = 'Cancelled';
      await order.save();
      res.status(400).json({ success: false, message: 'Invalid payment signature' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/my-orders
// @access  Private
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id }).populate('products.productId').sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all orders (Admin only)
// @route   GET /api/orders/all
// @access  Private/Admin
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate('userId', 'name email')
      .populate('products.productId', 'name image')
      .sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id).populate('userId', 'name email');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    order.status = status;
    await order.save();

    // Send email notification of order status change
    sendEmail({
      to: order.userId.email,
      subject: `SHOPEZ - Order Status Updated to: ${status}`,
      text: `Hi ${order.userId.name},\n\nWe wanted to let you know that the status of your order #${order._id} has been updated to: ${status}.\n\nThank you for shopping with SHOPEZ!\n\nBest regards,\nSHOPEZ Team`,
      html: `<h3>Hi ${order.userId.name},</h3>
             <p>We wanted to let you know that the status of your order <strong>#${order._id}</strong> has been updated to: <strong>${status}</strong>.</p>
             <p>Thank you for shopping with <strong>SHOPEZ</strong>!</p>
             <br/><p>Best regards,<br/>SHOPEZ Team</p>`
    }).catch(err => console.error('Status update email failed:', err));

    res.json({ success: true, message: 'Order status updated successfully', order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createOrder,
  verifyPayment,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
};
