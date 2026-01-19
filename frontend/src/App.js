import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import UserDashboard from './components/UserDashboard';
import AdminDashboard from './components/AdminDashboard';
import './App.css';

function App() {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || null);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <Router>
      <div className="app-wrapper">
        <nav className="navbar">
          <h1>NGO CARE</h1>
          {user && (
            <div>
              <span className="user-name">{user.name}</span>
              <button onClick={handleLogout} className="logout-btn">Logout</button>
            </div>
          )}
        </nav>
        <div className="container">
          <Routes>
            <Route path="/login" element={<Login setUser={handleLogin} />} />
            <Route path="/register" element={<Register />} />
            <Route 
              path="/user-dashboard" 
              element={user?.role === 'user' ? <UserDashboard user={user} /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/admin-dashboard" 
              element={user?.role === 'admin' ? <AdminDashboard /> : <Navigate to="/login" />} 
            />
            <Route path="/" element={<Navigate to="/login" />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;