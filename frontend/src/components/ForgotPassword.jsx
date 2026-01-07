import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { FaEnvelope } from "react-icons/fa";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!email.trim()) {
      setError("Email is required.");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post("http://localhost:5001/forgot-password/forgot-password", { email });

      setMessage(res.data.message || "Password reset link sent to your email.");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send reset link.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Reset Password 🔐</h2>
          <p>Enter your email to receive reset instructions</p>
        </div>

        {message && <div style={{ background: '#def6ec', border: '1px solid #009450', color: '#009450', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px' }}>{message}</div>}
        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleForgotPassword} className="auth-form">
          <div className="form-group">
            <label>Email Address</label>
            <div className="input-wrapper">
              <FaEnvelope className="input-icon" />
              <input
                type="email"
                placeholder="Enter your registered email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
          </div>
          <button type="submit" disabled={loading} className="auth-submit-btn">
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <div className="auth-links">
          <p>Remember your password? <Link to="/signin" className="link">Sign in here</Link></p>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
