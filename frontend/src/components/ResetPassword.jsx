import React, { useState } from "react";
import axios from "axios";
import { useParams, useNavigate, Link } from "react-router-dom";
import { FaLock } from "react-icons/fa";
import { toast } from "react-toastify";

function ResetPassword() {
  const { token } = useParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");

    if (!password.trim() || !confirmPassword.trim()) {
      setError("Both password fields are required.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post(
        `http://localhost:5001/reset-password/reset-password/${token}`,
        { password }
      );

      toast.success(res.data.message || "Password reset successfully!");
      navigate("/signin", { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to reset password. Token may have expired."
      );
      toast.error(
        err.response?.data?.message || "Failed to reset password. Token may have expired."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Reset Your Password 🔑</h2>
          <p>Enter your new password below</p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleResetPassword} className="auth-form">
          <div className="form-group">
            <label>New Password</label>
            <div className="input-wrapper">
              <FaLock className="input-icon" />
              <input
                type="password"
                placeholder="Enter new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Confirm Password</label>
            <div className="input-wrapper">
              <FaLock className="input-icon" />
              <input
                type="password"
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>
          </div>

          <button type="submit" disabled={loading} className="auth-submit-btn">
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>

        <div className="auth-links">
          <p>Remember your password? <Link to="/signin" className="link">Sign in here</Link></p>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;
