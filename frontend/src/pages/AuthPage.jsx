import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/api';
import './AuthPage.css';

const AuthPage = () => {
  const { login } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [guestMode, setGuestMode] = useState(true);

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (guestMode) {
        const response = await authService.guestLogin(formData.username);
        login(response.data.user, '');
      } else if (isLogin) {
        const response = await authService.login(formData.username, formData.password);
        login(response.data.user, response.data.token);
      } else {
        if (formData.password !== formData.confirmPassword) {
          throw new Error('Passwords do not match');
        }
        const response = await authService.register(
          formData.username,
          formData.email,
          formData.password
        );
        login(response.data.user, response.data.token);
      }
    } catch (err) {
      const validationMessage = err.errors?.map((item) => item.message).join('. ');
      const message = err.message === 'Network Error'
        ? 'Cannot reach the server. Make sure the backend is running on port 5000.'
        : err.message;
      setError(validationMessage || message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h1 className="auth-title">Real-Time Chat</h1>

        <div className="auth-mode-selector">
          <button
            type="button"
            className={`mode-btn ${guestMode ? '' : 'active'}`}
            onClick={() => {
              setGuestMode(false);
              setError('');
            }}
          >
            Account
          </button>
          <button
            type="button"
            className={`mode-btn ${guestMode ? 'active' : ''}`}
            onClick={() => {
              setGuestMode(true);
              setError('');
            }}
          >
            Guest
          </button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              placeholder="Enter username"
              value={formData.username}
              onChange={handleChange}
              required
              minLength="2"
              maxLength="30"
            />
          </div>

          {!guestMode && (
            <>
              {!isLogin && (
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="Enter email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              )}

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  placeholder="Enter password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength="6"
                />
              </div>

              {!isLogin && (
                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirm Password</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    placeholder="Confirm password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    minLength="6"
                  />
                </div>
              )}
            </>
          )}

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="submit-btn" disabled={isLoading}>
            {isLoading ? 'Loading...' : guestMode ? 'Continue as Guest' : isLogin ? 'Login' : 'Register'}
          </button>
        </form>

        {!guestMode && (
          <p className="auth-toggle">
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <button
              type="button"
              className="toggle-btn"
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
              }}
            >
              {isLogin ? 'Register' : 'Login'}
            </button>
          </p>
        )}
      </div>
    </div>
  );
};

export default AuthPage;
