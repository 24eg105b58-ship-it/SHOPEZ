const User = require('../models/User');
const Order = require('../models/Order');
const Product = require('../models/Product');

// --- WISHLIST CONTROLLERS ---

// @desc    Toggle item in wishlist
// @route   POST /api/users/wishlist/:productId
// @access  Private
const toggleWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const { productId } = req.params;
    const isWishlisted = user.wishlist.includes(productId);

    if (isWishlisted) {
      user.wishlist = user.wishlist.filter((id) => id.toString() !== productId.toString());
    } else {
      user.wishlist.push(productId);
    }

    await user.save();
    const updatedUser = await User.findById(req.user._id).populate('wishlist');
    res.json({ 
      success: true, 
      wishlist: updatedUser.wishlist, 
      message: isWishlisted ? 'Removed from wishlist' : 'Added to wishlist' 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user's wishlist
// @route   GET /api/users/wishlist
// @access  Private
const getWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('wishlist');
    res.json({ success: true, wishlist: user.wishlist });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// --- ADMIN MANAGEMENT CONTROLLERS ---

// @desc    Get all users (Admin only)
// @route   GET /api/users
// @access  Private/Admin
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a user (Admin only)
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({ success: false, message: 'Administrator accounts cannot be deleted' });
    }

    await user.deleteOne();
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get sales and store statistics (Admin only)
// @route   GET /api/users/admin/stats
// @access  Private/Admin
const getAdminStats = async (req, res) => {
  try {
    // 1. Total paid/shipped/delivered revenue and order counts
    const ordersStats = await Order.aggregate([
      { $match: { status: { $in: ['Paid', 'Shipped', 'Delivered'] } } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalAmount' },
          totalOrders: { $sum: 1 },
        },
      },
    ]);

    const totalRevenue = ordersStats[0]?.totalRevenue || 0;
    const totalOrdersCount = ordersStats[0]?.totalOrders || 0;

    // 2. Count of users
    const totalUsersCount = await User.countDocuments({});

    // 3. Count of products
    const totalProductsCount = await Product.countDocuments({});

    // 4. Sales by product category
    const orders = await Order.find({ status: { $in: ['Paid', 'Shipped', 'Delivered'] } })
      .populate('products.productId', 'category');

    const categoryStatsMap = {};
    orders.forEach((order) => {
      order.products.forEach((item) => {
        const category = item.productId?.category || 'Uncategorized';
        const revenue = item.price * item.quantity;
        if (!categoryStatsMap[category]) {
          categoryStatsMap[category] = 0;
        }
        categoryStatsMap[category] += revenue;
      });
    });

    const categoryStats = Object.keys(categoryStatsMap).map((cat) => ({
      category: cat,
      revenue: categoryStatsMap[cat],
    }));

    // 5. Recent orders list
    const recentOrders = await Order.find({ status: { $in: ['Paid', 'Shipped', 'Delivered'] } })
      .populate('userId', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      stats: {
        totalRevenue,
        totalOrders: totalOrdersCount,
        totalUsers: totalUsersCount,
        totalProducts: totalProductsCount,
        categoryStats,
        recentOrders,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  toggleWishlist,
  getWishlist,
  getAllUsers,
  deleteUser,
  getAdminStats,
};
