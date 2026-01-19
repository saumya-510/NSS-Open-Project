import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'user' });
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/register', form);
      alert("Registration successful! Your data is saved. Now please login.");
      navigate('/login');
    } catch (err) {
      alert("Registration failed. Email might already exist.");
    }
  };

  return (
    <div className="card">
      <h2>Create Account</h2>
      <form onSubmit={handleRegister}>
        <input placeholder="Full Name" required onChange={e => setForm({...form, name: e.target.value})} />
        <input type="email" placeholder="Email Address" required onChange={e => setForm({...form, email: e.target.value})} />
        <input type="password" placeholder="Password" required onChange={e => setForm({...form, password: e.target.value})} />
        <select onChange={e => setForm({...form, role: e.target.value})}>
          <option value="user">Donor (User)</option>
          <option value="admin">Admin</option>
        </select>
        <button type="submit">Register</button>
      </form>
    </div>
  );
};
export default Register;