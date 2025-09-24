import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import { Eye, EyeOff, Mail, Lock, User, UserCheck } from 'lucide-react';
import logo from '../../Assets/logo2.png';
import './Auth.css';

const Signup = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { signup } = useAuth();
  const { showSuccess } = useNotification();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setError('');

    const result = await signup(
      formData.email,
      formData.password,
      formData.firstName,
      formData.lastName
    );
    
    if (result.success) {
      showSuccess('Account created successfully! Please login again.');
      navigate('/login');
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <img src={logo} alt="CRM Logo" className="auth-logo" />
          <h1>Create Account</h1>
          <p>Join CRM LaitusNeo as a Main User</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
            <div
              style={{
                position: "relative",
                width: "100%",
              }}
            >
              <label
                htmlFor="firstName"
                style={{
                  display: "block",
                  color: "#374151",
                  fontWeight: 600,
                  marginBottom: "6px",
                  fontSize: "12px",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                First Name
              </label>

              <div
                style={{
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  width: "100%",
                }}
              >
                <User
                  style={{
                    position: "absolute",
                    left: "12px",
                    pointerEvents: "none",
                    color: "#9ca3af",
                    height: "18px",
                    width: "18px",
                  }}
                />

                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="First name"
                  required
                  aria-label="First name"
                  style={{
                    width: "100%",
                    padding: "10px 12px 10px 40px",
                    height: "44px",
                    borderRadius: "10px",
                    border: "1px solid #e5e7eb",
                    background: "#fff",
                    fontSize: "14px",
                    color: "#111827",
                    outline: "none",
                    transition: "border-color 0.2s ease, box-shadow 0.2s ease",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#2563eb";
                    e.target.style.boxShadow = "0 0 0 3px rgba(37,99,235,0.15)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#e5e7eb";
                    e.target.style.boxShadow = "none";
                  }}
                />
              </div>
            </div>

            <div
              style={{
                position: "relative",
                width: "100%",
              }}
            >
              <label
                htmlFor="lastName"
                style={{
                  display: "block",
                  color: "#374151",
                  fontWeight: 600,
                  marginBottom: "6px",
                  fontSize: "12px",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                Last Name
              </label>

              <div
                style={{
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  width: "100%",
                }}
              >
                <UserCheck
                  style={{
                    position: "absolute",
                    left: "12px",
                    pointerEvents: "none",
                    color: "#9ca3af",
                    height: "18px",
                    width: "18px",
                  }}
                />

                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Last name"
                  required
                  aria-label="Last name"
                  style={{
                    width: "100%",
                    padding: "10px 12px 10px 40px",
                    height: "44px",
                    borderRadius: "10px",
                    border: "1px solid #e5e7eb",
                    background: "#fff",
                    fontSize: "14px",
                    color: "#111827",
                    outline: "none",
                    transition: "border-color 0.2s ease, box-shadow 0.2s ease",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#2563eb";
                    e.target.style.boxShadow = "0 0 0 3px rgba(37,99,235,0.15)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#e5e7eb";
                    e.target.style.boxShadow = "none";
                  }}
                />
              </div>
            </div>
          </div>

          <div
            style={{
              position: "relative",
              marginBottom: "16px",
              width: "100%",
            }}
          >
            <label
              htmlFor="email"
              style={{
                display: "block",
                color: "#374151",
                fontWeight: 600,
                marginBottom: "6px",
                fontSize: "12px",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              Email Address
            </label>

            <div
              style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
                width: "100%",
              }}
            >
              <Mail
                style={{
                  position: "absolute",
                  left: "12px",
                  pointerEvents: "none",
                  color: "#9ca3af",
                  height: "18px",
                  width: "18px",
                }}
              />

              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                required
                aria-label="Email address"
                style={{
                  width: "100%",
                  padding: "10px 12px 10px 40px",
                  height: "44px",
                  borderRadius: "10px",
                  border: "1px solid #e5e7eb",
                  background: "#fff",
                  fontSize: "14px",
                  color: "#111827",
                  outline: "none",
                  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#2563eb";
                  e.target.style.boxShadow = "0 0 0 3px rgba(37,99,235,0.15)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#e5e7eb";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>
          </div>

          <div
            style={{
              position: "relative",
              marginBottom: "16px",
              width: "100%",
            }}
          >
            <label
              htmlFor="password"
              style={{
                display: "block",
                color: "#374151",
                fontWeight: 600,
                marginBottom: "6px",
                fontSize: "12px",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              Password
            </label>

            <div
              style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
                width: "100%",
              }}
            >
              <Lock
                style={{
                  position: "absolute",
                  left: "12px",
                  pointerEvents: "none",
                  color: "#9ca3af",
                  height: "18px",
                  width: "18px",
                }}
              />

              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a password"
                required
                aria-label="Password"
                style={{
                  width: "100%",
                  padding: "10px 40px 10px 40px",
                  height: "44px",
                  borderRadius: "10px",
                  border: "1px solid #e5e7eb",
                  background: "#fff",
                  fontSize: "14px",
                  color: "#111827",
                  outline: "none",
                  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#2563eb";
                  e.target.style.boxShadow = "0 0 0 3px rgba(37,99,235,0.15)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#e5e7eb";
                  e.target.style.boxShadow = "none";
                }}
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: "12px",
                  background: "none",
                  border: "none",
                  color: "#9ca3af",
                  cursor: "pointer",
                  padding: "0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "18px",
                  width: "18px",
                }}
                onMouseEnter={(e) => {
                  e.target.style.color = "#2563eb";
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = "#9ca3af";
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            
            <div style={{ marginTop: "4px" }}>
              <small style={{ color: "#6b7280", fontSize: "11px" }}>
                Password must be at least 8 characters with uppercase, lowercase, and number
              </small>
            </div>
          </div>

          <div
            style={{
              position: "relative",
              marginBottom: "16px",
              width: "100%",
            }}
          >
            <label
              htmlFor="confirmPassword"
              style={{
                display: "block",
                color: "#374151",
                fontWeight: 600,
                marginBottom: "6px",
                fontSize: "12px",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              Confirm Password
            </label>

            <div
              style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
                width: "100%",
              }}
            >
              <Lock
                style={{
                  position: "absolute",
                  left: "12px",
                  pointerEvents: "none",
                  color: "#9ca3af",
                  height: "18px",
                  width: "18px",
                }}
              />

              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
                required
                aria-label="Confirm password"
                style={{
                  width: "100%",
                  padding: "10px 40px 10px 40px",
                  height: "44px",
                  borderRadius: "10px",
                  border: "1px solid #e5e7eb",
                  background: "#fff",
                  fontSize: "14px",
                  color: "#111827",
                  outline: "none",
                  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#2563eb";
                  e.target.style.boxShadow = "0 0 0 3px rgba(37,99,235,0.15)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#e5e7eb";
                  e.target.style.boxShadow = "none";
                }}
              />

              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                style={{
                  position: "absolute",
                  right: "12px",
                  background: "none",
                  border: "none",
                  color: "#9ca3af",
                  cursor: "pointer",
                  padding: "0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "18px",
                  width: "18px",
                }}
                onMouseEnter={(e) => {
                  e.target.style.color = "#2563eb";
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = "#9ca3af";
                }}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="auth-button"
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Already have an account?{' '}
            <Link to="/login" className="auth-link">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
