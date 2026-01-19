require('dotenv').config();
const express = require('express');
const cors = require('cors');
const Razorpay = require('razorpay');
const sequelize = require('./config/database');
const User = require('./models/User');
const Donation = require('./models/Donation');

const app = express();
app.use(express.json());
app.use(cors());

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Sync database and create tables
sequelize.sync().then(() => console.log("✅ SQL Database Connected & Synced"));

// 1. Register Route (Saves immediately)
app.post('/api/register', async (req, res) => {
  try {
    const user = await User.create(req.body);
    res.status(201).json({ message: "Registration successful", user });
  } catch (err) {
    res.status(400).json({ error: "Email already exists or invalid data" });
  }
});

// 2. Login Route
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email, password } });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });
    res.json({ user: { id: user.id, name: user.name, role: user.role } });
  } catch (err) { res.status(500).json({ error: "Server error" }); }
});

// 3. Create Donation Order
app.post('/api/donate/create-order', async (req, res) => {
  const { amount, userId } = req.body;
  try {
    const order = await razorpay.orders.create({ amount: amount * 100, currency: "INR" });
    
    // Save as pending regardless of payment completion
    await Donation.create({
      amount,
      userId,
      razorpay_order_id: order.id,
      status: 'pending'
    });
    
    res.json(order);
  } catch (err) { res.status(500).json({ error: "Razorpay error" }); }
});

// 4. Verify Payment
app.post('/api/donate/verify', async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id } = req.body;
  try {
    await Donation.update(
      { status: 'success', razorpay_payment_id },
      { where: { razorpay_order_id } }
    );
    res.json({ status: "success" });
  } catch (err) { res.status(500).json({ error: "Verification failed" }); }
});

// 5. Get User Donations
app.get('/api/donations/:userId', async (req, res) => {
  const list = await Donation.findAll({ where: { userId: req.params.userId } });
  res.json(list);
});

// 6. Admin: Get Everything (Populated)
app.get('/api/admin/all-donations', async (req, res) => {
  const list = await Donation.findAll({ include: [User] });
  res.json(list);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));