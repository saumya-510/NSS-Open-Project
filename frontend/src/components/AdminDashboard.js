import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminDashboard = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:5000/api/admin/all-donations')
      .then(res => setData(res.data))
      .catch(err => console.log(err));
  }, []);

  const totalRaised = data
    .filter(d => d.status === 'success')
    .reduce((sum, current) => sum + current.amount, 0);

  return (
    <div className="card">
      <h2>Admin Panel</h2>
      <div className="stats-row">
        <div className="stat-card">Total Donations: ₹{totalRaised}</div>
        <div className="stat-card">Total Records: {data.length}</div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Donor Name</th>
            <th>Email</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Time</th>
          </tr>
        </thead>
        <tbody>
          {data.map(d => (
            <tr key={d.id}>
              <td>{d.User?.name || 'N/A'}</td>
              <td>{d.User?.email || 'N/A'}</td>
              <td>₹{d.amount}</td>
              <td className={d.status}>{d.status}</td>
              <td>{new Date(d.createdAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
export default AdminDashboard;