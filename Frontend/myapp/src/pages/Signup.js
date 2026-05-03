import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/api';

function Signup({ setIsAuthenticated }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    userType: 'user',
    specialization: '',
    licenseNumber: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const validateForm = () => {
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('All fields are required');
      return false;
    }

    if (formData.name.length < 2) {
      setError('Name must be at least 2 characters long');
      return false;
    }

    // Email validation
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please provide a valid email address');
      return false;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    // Validate practitioner fields
    if (formData.userType === 'practitioner') {
      if (!formData.specialization || !formData.licenseNumber) {
        setError('Practitioners must provide specialization and license number');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const signupData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        userType: formData.userType
      };

      if (formData.userType === 'practitioner') {
        signupData.specialization = formData.specialization;
        signupData.licenseNumber = formData.licenseNumber;
      }

      await authService.signup(signupData.name, signupData.email, signupData.password, signupData.userType, signupData.specialization, signupData.licenseNumber);
      setSuccess('Account created successfully! Please login to continue.');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Signup failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-5">
          <div className="card shadow-lg border-0">
            <div className="card-body p-5">
              <h2 className="text-center mb-4 fw-bold">Create Account</h2>
              <p className="text-center text-muted mb-4">Start your mental wellness journey today</p>
              
              {error && (
                <div className="alert alert-danger" role="alert" aria-live="assertive">
                  {error}
                </div>
              )}

              {success && (
                <div className="alert alert-success" role="alert" aria-live="assertive">
                  {success}
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate>
                {/* Account Type Selection */}
                <div className="mb-4">
                  <label className="form-label fw-bold">Account Type</label>
                  <div className="row g-2">
                    <div className="col-6">
                      <button
                        type="button"
                        className={`btn w-100 ${formData.userType === 'user' ? 'btn-primary' : 'btn-outline-primary'}`}
                        onClick={() => setFormData({ ...formData, userType: 'user' })}
                      >
                        👤 User
                      </button>
                    </div>
                    <div className="col-6">
                      <button
                        type="button"
                        className={`btn w-100 ${formData.userType === 'practitioner' ? 'btn-primary' : 'btn-outline-primary'}`}
                        onClick={() => setFormData({ ...formData, userType: 'practitioner' })}
                      >
                        👨‍⚕️ Practitioner
                      </button>
                    </div>
                  </div>
                  {formData.userType === 'practitioner' && (
                    <div className="alert alert-info mt-2 mb-0" role="alert">
                      <small>As a medical practitioner, you'll be able to provide professional support to users.</small>
                    </div>
                  )}
                </div>

                <div className="mb-3">
                  <label htmlFor="name" className="form-label">Full Name</label>
                  <input
                    type="text"
                    className="form-control"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    aria-required="true"
                    placeholder="Enter your full name"
                    minLength="2"
                  />
                </div>

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
                    placeholder="Enter your email"
                  />
                </div>

                {/* Practitioner-specific fields */}
                {formData.userType === 'practitioner' && (
                  <>
                    <div className="mb-3">
                      <label htmlFor="specialization" className="form-label">Specialization *</label>
                      <input
                        type="text"
                        className="form-control"
                        id="specialization"
                        name="specialization"
                        value={formData.specialization}
                        onChange={handleChange}
                        required={formData.userType === 'practitioner'}
                        placeholder="e.g., Clinical Psychologist, Psychiatrist"
                      />
                    </div>

                    <div className="mb-3">
                      <label htmlFor="licenseNumber" className="form-label">License Number *</label>
                      <input
                        type="text"
                        className="form-control"
                        id="licenseNumber"
                        name="licenseNumber"
                        value={formData.licenseNumber}
                        onChange={handleChange}
                        required={formData.userType === 'practitioner'}
                        placeholder="Enter your professional license number"
                      />
                    </div>
                  </>
                )}

                <div className="mb-3">
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
                    placeholder="Create a password"
                    minLength="6"
                  />
                  <div className="form-text">
                    Password must be at least 6 characters long
                  </div>
                </div>

                <div className="mb-4">
                  <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
                  <input
                    type="password"
                    className="form-control"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    aria-required="true"
                    placeholder="Confirm your password"
                  />
                </div>

                <button 
                  type="submit" 
                  className="btn btn-primary w-100 py-2 mb-3"
                  disabled={loading}
                  aria-label="Create your account"
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Creating Account...
                    </>
                  ) : (
                    'Sign Up'
                  )}
                </button>
              </form>

              <div className="text-center mt-4">
                <p className="mb-2">Already have an account? <Link to="/login">Login here</Link></p>
              </div>

              <hr className="my-4" />

              <div className="text-center">
                <p className="text-muted mb-2">Or sign up with</p>
                <button className="btn btn-outline-secondary me-2" disabled>
                  <span aria-label="Google">🔍</span> Google
                </button>
                <button className="btn btn-outline-secondary" disabled>
                  <span aria-label="Facebook">📘</span> Facebook
                </button>
                <p className="text-muted mt-2">
                  <small>(Social signup coming soon)</small>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signup;