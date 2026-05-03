import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/api';

function Login({ setIsAuthenticated }) {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validation
    if (!formData.email || !formData.password) {
      setError('Please provide both email and password');
      setLoading(false);
      return;
    }

    try {
      await authService.login(formData.email, formData.password);
      setIsAuthenticated(true);
      
      // Check user type and redirect accordingly
      const user = JSON.parse(localStorage.getItem('user'));
      if (user?.userType === 'practitioner') {
        navigate('/professional-help');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-5">
          <div className="card shadow-lg border-0">
            <div className="card-body p-5">
              <h2 className="text-center mb-4 fw-bold">Welcome Back</h2>
              <p className="text-center text-muted mb-4">Login to continue your wellness journey</p>
              
              {error && (
                <div className="alert alert-danger" role="alert" aria-live="assertive">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate>
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">Email Address</label>
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    aria-required="true"
                    aria-describedby="emailHelp"
                    placeholder="Enter your email"
                  />
                  <div id="emailHelp" className="form-text">
                    We'll never share your email with anyone else.
                  </div>
                </div>

                <div className="mb-4">
                  <label htmlFor="password" className="form-label">Password</label>
                  <input
                    type="password"
                    className="form-control"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    aria-required="true"
                    placeholder="Enter your password"
                    minLength="6"
                  />
                </div>

                <button 
                  type="submit" 
                  className="btn btn-primary w-100 py-2 mb-3"
                  disabled={loading}
                  aria-label="Login to your account"
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Logging in...
                    </>
                  ) : (
                    'Login'
                  )}
                </button>
              </form>

              <div className="text-center mt-4">
                <p className="mb-2">Don't have an account? <Link to="/signup">Sign up here</Link></p>
              </div>

              <hr className="my-4" />

              <div className="text-center">
                <p className="text-muted mb-2">Or continue with</p>
                <button className="btn btn-outline-secondary me-2" disabled>
                  <span aria-label="Google">🔍</span> Google
                </button>
                <button className="btn btn-outline-secondary" disabled>
                  <span aria-label="Facebook">📘</span> Facebook
                </button>
                <p className="text-muted mt-2">
                  <small>(Social login coming soon)</small>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;