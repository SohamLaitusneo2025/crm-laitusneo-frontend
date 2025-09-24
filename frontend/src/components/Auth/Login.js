import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import { Eye, EyeOff, Mail, Lock, User, UserCheck, X } from 'lucide-react';
import logo from '../../Assets/logo2.png';
import './Auth.css';

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        username: '',
        password: '',
        userType: 'main'
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const { login } = useAuth();
    const { showSuccess } = useNotification();
    const navigate = useNavigate();

    // Auto-dismiss error popup after 5 seconds
    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => {
                setError('');
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [error]);

    const handleCloseError = () => {
        setError('');
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error when user starts typing
        if (error) setError('');
    };

    const handleUserTypeChange = (e) => {
        const { value } = e.target;
        setFormData(prev => ({
            ...prev,
            userType: value,
            email: '', // Clear email when switching user types
            username: '' // Clear username when switching user types
        }));
        if (error) setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // For sub-users, use username; for main users, use email
        const result = await login(formData.email, formData.password, formData.userType, formData.username);

        if (result.success) {
            showSuccess('Login successful! Welcome back!');
            // Redirect based on user type
            if (result.user.user_type === 'sub') {
                navigate('/sub-user');
            } else {
                navigate('/');
            }
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
                    <h1>Welcome Back</h1>
                    <p>Sign in to your CRM account</p>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    {error && (
                        <div className="error-message" role="alert">
                            <span>{error}</span>
                            <button 
                                type="button" 
                                className="close-btn" 
                                onClick={handleCloseError}
                                aria-label="Close error message"
                            >
                                <X size={12} />
                            </button>
                        </div>
                    )}

          <div
            style={{
              position: "relative",
              marginBottom: "16px",
              width: "100%",
            }}
          >
            <label
              htmlFor="userType"
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
              User Type
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

              <select
                id="userType"
                name="userType"
                value={formData.userType}
                onChange={handleUserTypeChange}
                required
                aria-label="User type"
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
                  appearance: "none",
                  backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e\")",
                  backgroundPosition: "right 12px center",
                  backgroundRepeat: "no-repeat",
                  backgroundSize: "16px",
                  paddingRight: "40px",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#2563eb";
                  e.target.style.boxShadow = "0 0 0 3px rgba(37,99,235,0.15)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#e5e7eb";
                  e.target.style.boxShadow = "none";
                }}
              >
                <option value="main">Main User</option>
                <option value="sub">Sub User</option>
              </select>
            </div>
          </div>

                    {/* <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <div className="input-wrapper">
              <Mail className="input-icon" />
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="form-input"
                placeholder="Enter your email"
                required
              />
            </div>
          </div> */}
                  <div
  style={{
    position: "relative",
    marginBottom: "16px",
    width: "100%",
  }}
>
  <label
    htmlFor={formData.userType === 'sub' ? 'username' : 'email'}
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
    {formData.userType === 'sub' ? 'Username' : 'Email Address'}
  </label>

  {/* Wrapper around input + icon ensures proper vertical alignment */}
  <div
    style={{
      position: "relative",
      display: "flex",
      alignItems: "center",
      width: "100%",
    }}
  >
    {formData.userType === 'sub' ? (
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
    ) : (
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
    )}

    <input
      type={formData.userType === 'sub' ? 'text' : 'email'}
      id={formData.userType === 'sub' ? 'username' : 'email'}
      name={formData.userType === 'sub' ? 'username' : 'email'}
      value={formData.userType === 'sub' ? (formData.username || '') : (formData.email || '')}
      onChange={handleChange}
      placeholder={formData.userType === 'sub' ? 'Enter your username' : 'Enter your email'}
      required
      aria-label={formData.userType === 'sub' ? 'Username' : 'Email address'}
      style={{
        width: "100%",
        padding: "10px 12px 10px 40px", // padding to fit icon
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
                placeholder="Enter your password"
                required
                aria-label="Password"
                style={{
                  width: "100%",
                  padding: "10px 40px 10px 40px", // padding for both icon and toggle
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
          </div>

                    <button
                        type="submit"
                        className="auth-button"
                        disabled={loading}
                    >
                        {loading ? 'Signing In...' : 'Sign In'}
                    </button>
                </form>

                <div className="auth-footer">
                    <p>
                        Don't have an account?{' '}
                        <Link to="/signup" className="auth-link">
                            Sign up here
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
