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
      // Step 1: Create 'pending' order on backend
      const { data: order } = await axios.post('http://localhost:5000/api/donate/create-order', {
        amount, userId: user.id
      });

      const options = {
        key: "rzp_test_S5Rax5kfi1KpYN", // REPLACE WITH YOUR ACTUAL KEY
        amount: order.amount,
        currency: "INR",
        name: "NGO CARE",
        description: "Donation Support",
        order_id: order.id,
        handler: async (response) => {
          // Success Path
          await axios.post('http://localhost:5000/api/donate/verify', response);
          alert("Donation successful!");
          setAmount('');
          fetchHistory();
        },
        modal: {
          ondismiss: function() {
            // Refresh to show that the record is now 'Pending' in history
            fetchHistory();
          }
        },
        prefill: { name: user.name, email: user.email },
        theme: { color: "#00a8e1" }
      };

      const rzp = new window.Razorpay(options);

      // Step 2: Handle Failure Path (e.g. wrong OTP, insufficient funds)
      rzp.on('payment.failed', async function (response) {
        await axios.post('http://localhost:5000/api/donate/failure', {
          razorpay_order_id: order.id,
          reason: response.error.description
        });
        fetchHistory();
      });

      rzp.open();
    } catch (err) {
      alert("Error starting payment.");
    }
  };

  return (
    <div className="card">
      <h2>Welcome, {user.name}</h2>
      <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', margin: '20px 0' }}>
        <h3>Make a Donation</h3>
        <input 
          type="number" 
          placeholder="Enter Amount (₹)" 
          value={amount} 
          onChange={e => setAmount(e.target.value)} 
        />
        <button onClick={handleDonate} style={{ marginTop: '10px' }}>Donate Now</button>
      </div>

      <h3>Recent Transactions</h3>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Amount</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {history.map(item => (
            <tr key={item.id}>
              <td>{new Date(item.createdAt).toLocaleDateString()}</td>
              <td>₹{item.amount}</td>
              <td>
                <span className={`status-tag status-${item.status}`}>
                  {item.status.toUpperCase()}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserDashboard;