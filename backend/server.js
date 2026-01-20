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

// Sync Database
sequelize.sync().then(() => console.log("✅ SQL Database Connected & Synced"));

// --- AUTH ROUTES ---
app.post('/api/register', async (req, res) => {
  try {
    const user = await User.create(req.body);
    res.status(201).json({ message: "Registered", user });
  } catch (err) { res.status(400).json({ error: "Registration failed" }); }
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ where: { email, password } });
  if (user) res.json({ user: { id: user.id, name: user.name, role: user.role } });
  else res.status(401).json({ error: "Invalid credentials" });
});

// --- DONATION ROUTES ---

// 1. Create Order (Saves as 'pending' immediately)
app.post('/api/donate/create-order', async (req, res) => {
  const { amount, userId } = req.body;
  try {
    const order = await razorpay.orders.create({ amount: amount * 100, currency: "INR" });
    
    // Create record in SQL now so we can track 'pending' status
    await Donation.create({
      amount,
      userId,
      razorpay_order_id: order.id,
      status: 'pending'
    });
    
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: "Razorpay Order Creation Failed" });
  }
});

// 2. Verify Success
app.post('/api/donate/verify', async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id } = req.body;
  try {
    await Donation.update(
      { status: 'success', razorpay_payment_id },
      { where: { razorpay_order_id } }
    );
    res.json({ status: "success" });
  } catch (err) {
    res.status(500).json({ error: "Verification failed" });
  }
});

// 3. Record Failure
app.post('/api/donate/failure', async (req, res) => {
  const { razorpay_order_id, reason } = req.body;
  try {
    await Donation.update(
      { status: 'failed', failure_reason: reason },
      { where: { razorpay_order_id } }
    );
    res.json({ status: "failure_recorded" });
  } catch (err) {
    res.status(500).json({ error: "Could not record failure" });
  }
});

// 4. Fetch User History
app.get('/api/donations/:userId', async (req, res) => {
  const list = await Donation.findAll({ where: { userId: req.params.userId }, order: [['createdAt', 'DESC']] });
  res.json(list);
});

// 5. Admin View All
app.get('/api/admin/all-donations', async (req, res) => {
  const list = await Donation.findAll({ include: [User], order: [['createdAt', 'DESC']] });
  res.json(list);
});

app.listen(5000, () => console.log(`🚀 Server running on http://localhost:5000`));