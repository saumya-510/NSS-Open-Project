import React, { useState, useEffect } from 'react';
import axios from 'axios';

const UserDashboard = ({ user }) => {
  const [amount, setAmount] = useState('');
  const [history, setHistory] = useState([]);

  const fetchHistory = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/donations/${user.id}`);
      setHistory(res.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchHistory(); }, []);

  const handleDonate = async () => {
    if (!amount || amount <= 0) return alert("Please enter a valid amount");

    try {
      // 1. Create order on backend
      const { data: order } = await axios.post('http://localhost:5000/api/donate/create-order', {
        amount, userId: user.id
      });

      // 2. Open Razorpay Popup
      const options = {
        key: "rzp_test_S5Rax5kfi1KpYN",
        amount: order.amount,
        currency: "INR",
        name: "NGO Donation",
        description: "Supporting the cause",
        order_id: order.id,
        handler: async (response) => {
          // 3. Verify on backend after success
          await axios.post('http://localhost:5000/api/donate/verify', response);
          alert("Donation successful!");
          setAmount('');
          fetchHistory();
        },
        prefill: { name: user.name, email: user.email },
        theme: { color: "#3498db" }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      alert("Error starting payment.");
    }
  };

  return (
    <div className="card">
      <h2>Welcome, {user.name}</h2>
      <div className="donation-box">
        <h3>Support our Mission</h3>
        <input type="number" placeholder="Enter Amount (₹)" value={amount} onChange={e => setAmount(e.target.value)} />
        <button onClick={handleDonate}>Donate Now</button>
      </div>

      <h3>Your Donation History</h3>
      <table>
        <thead><tr><th>Date</th><th>Amount</th><th>Status</th></tr></thead>
        <tbody>
          {history.map(item => (
            <tr key={item.id}>
              <td>{new Date(item.createdAt).toLocaleDateString()}</td>
              <td>₹{item.amount}</td>
              <td className={item.status}>{item.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
export default UserDashboard;