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

  const pendingCount = data.filter(d => d.status === 'pending').length;
  const failedCount = data.filter(d => d.status === 'failed').length;

  return (
    <div className="card">
      <h2 style={{ color: '#2d3748' }}>Admin Oversight</h2>
      
      <div className="stats-row">
        <div className="stat-card" style={{ background: '#2f855a' }}>
          <h3>₹{totalRaised.toLocaleString()}</h3>
          <p>Successful Donations</p>
        </div>
        <div className="stat-card" style={{ background: '#c05621' }}>
          <h3>{pendingCount}</h3>
          <p>Abandoned (Pending)</p>
        </div>
        <div className="stat-card" style={{ background: '#c53030' }}>
          <h3>{failedCount}</h3>
          <p>Failed Payments</p>
        </div>
      </div>

      <div className="table-container">
        <h3>All Transaction Logs</h3>
        <table>
          <thead>
            <tr>
              <th>Donor</th>
              <th>Email</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {data.map(d => (
              <tr key={d.id}>
                <td><strong>{d.User?.name}</strong></td>
                <td>{d.User?.email}</td>
                <td>₹{d.amount}</td>
                <td>
                  <span className={`status-tag status-${d.status}`}>
                    {d.status.toUpperCase()}
                  </span>
                </td>
                <td>{new Date(d.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDashboard;