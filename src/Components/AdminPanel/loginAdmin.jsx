// loginAdmin.js
import React, { useState } from 'react';
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from '../../firebase';// Adjust the import path as needed
 
import './loginAdmin.css'; // Adjust the import path as needed
import AdminPanel from './AdminPanel';
 
function LoginAdmin() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
  
    const handleLogin = async (e) => {
      e.preventDefault();
      setError('');
  
      try {
        await signInWithEmailAndPassword(auth, email, password);
        setIsAuthenticated(true);
      } catch (err) {
        setError(err.message);
      }
    };
  
    if (isAuthenticated) {
      return <AdminPanel />;
    }
  
    return (
      <div className="loginAdmin">
        <form onSubmit={handleLogin}>
          <h2>Admin Login</h2>
          <div>
            <label>Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label>Password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="error">{error}</p>}
          <button type="submit">Login</button>
        </form>
      </div>
    );
  }
  
  export default LoginAdmin;