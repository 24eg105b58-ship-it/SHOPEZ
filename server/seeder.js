const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

// Models
const User = require('./models/User');
const Product = require('./models/Product');
const Cart = require('./models/Cart');
const Order = require('./models/Order');

// Config
const connectDB = require('./config/db');

dotenv.config();

const products = [
  {
    name: 'iPhone 14 Pro Max',
    description: 'Featuring Dynamic Island, a 48MP Main camera, and the A16 Bionic chip. Experience the ultimate smartphone technology.',
    price: 129999,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1678685888221-cda773a3dcdb?w=600&auto=format&fit=crop&q=60',
    stock: 15,
  },
  {
    name: 'Sony WH-1000XM4 Wireless',
    description: 'Industry-leading noise canceling headphones with premium sound quality, smart listening technology, and 30-hour battery life.',
    price: 19990,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=60',
    stock: 25,
  },
  {
    name: 'Nike Air Max Sneaker',
    description: 'Classic athletic shoe designed for running or lifestyle wear. Featuring a comfortable foam midsole and visible Air cushioning.',
    price: 9999,
    category: 'Footwear',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=60',
    stock: 30,
  },
  {
    name: 'Minimalist Leather Wallet',
    description: 'Handcrafted genuine leather slim wallet with RFID blocking technology, card slots, and an integrated cash strap.',
    price: 1499,
    category: 'Accessories',
    image: 'https://images.unsplash.com/photo-1627124765135-56530125432f?w=600&auto=format&fit=crop&q=60',
    stock: 50,
  },
  {
    name: 'Ergonomic Office Chair',
    description: 'High-back mesh chair featuring adjustable lumbar support, 3D armrests, and dynamic reclining settings for peak productivity.',
    price: 14999,
    category: 'Furniture',
    image: 'https://images.unsplash.com/photo-1592078615290-033ee584e267?w=600&auto=format&fit=crop&q=60',
    stock: 8,
  },
  {
    name: 'Stainless Water Bottle',
    description: 'Double-walled vacuum insulated bottle that keeps beverages cold for 24 hours or hot for 12 hours. Sweat-free finish.',
    price: 1199,
    category: 'Outdoors',
    image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&auto=format&fit=crop&q=60',
    stock: 100,
  },
];

const seedData = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/shopez';
    await mongoose.connect(mongoURI);

    // Clear existing data
    await User.deleteMany();
    await Product.deleteMany();
    await Cart.deleteMany();
    await Order.deleteMany();

    console.log('Database cleared.');

    // Add Admin and standard User
    const adminPassword = await bcrypt.hash('admin123', 10);
    const userPassword = await bcrypt.hash('user123', 10);

    const createdUsers = await User.create([
      {
        name: 'Demo Admin',
        email: 'admin@shopez.com',
        password: 'admin123', // Will be hashed by pre-save hooks
        role: 'admin',
      },
      {
        name: 'Demo User',
        email: 'user@shopez.com',
        password: 'user123', // Will be hashed by pre-save hooks
        role: 'user',
      },
    ]);

    console.log('Default users registered:');
    console.log(`- Admin: admin@shopez.com (password: admin123)`);
    console.log(`- User: user@shopez.com (password: user123)`);

    // Insert Products
    await Product.insertMany(products);
    console.log('Sample products seeded successfully!');

    process.exit(0);
  } catch (error) {
    console.error(`Error seeding database: ${error.message}`);
    process.exit(1);
  }
};

seedData();
