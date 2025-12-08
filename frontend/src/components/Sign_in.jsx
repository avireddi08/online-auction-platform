import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { FaEye, FaEyeSlash, FaEnvelope, FaLock } from "react-icons/fa";

function Signin() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignin = async (e) => {
    e.preventDefault();
    setError('');

    if (!identifier.trim() || !password.trim()) {
      setError('Username/Email and Password are required.');
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post('http://localhost:5001/auth/signin', {
        identifier,
        password,
      });

      if (res.data.token) {
        localStorage.setItem('authToken', res.data.token);
        localStorage.setItem('username', res.data.username);
        localStorage.setItem('email', res.data.email);
        console.log('Signin Response:', res.data);
        navigate('/dashboard', { replace: true });
      } else {
        setError('Invalid credentials.');
      }
    } catch (err) {
      console.error('Signin Error:', err);
      setError(err.response?.data?.message || 'Failed to sign in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Welcome Back! 👋</h2>
          <p>Sign in to your account</p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSignin} className="auth-form">
          <div className="form-group">
            <label>Username or Email</label>
            <div className="input-wrapper">
              <FaEnvelope className="input-icon" />
              <input
                type="text"
                placeholder="Enter your username or email"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Password</label>
            <div className="input-wrapper">
              <FaLock className="input-icon" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} className="auth-submit-btn">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="auth-links">
          <div className="link-item">
            <p>Don't have an account? <Link to="/signup" className="link">Sign up here</Link></p>
          </div>
          <div className="link-item">
            <Link to="/forgot-password" className="link">Forgot Password?</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signin;
