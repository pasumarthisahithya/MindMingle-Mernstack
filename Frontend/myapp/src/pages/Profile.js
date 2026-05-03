import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    specialization: '',
    licenseNumber: ''
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    if (userData) {
      setUser(userData);
      setFormData({
        name: userData.name || '',
        email: userData.email || '',
        specialization: userData.specialization || '',
        licenseNumber: userData.licenseNumber || ''
      });
    }
    setLoading(false);
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!formData.name || formData.name.length < 2) {
      setError('Name must be at least 2 characters long');
      return;
    }

    try {
      // Update local storage
      const updatedUser = {
        ...user,
        name: formData.name,
        email: formData.email
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      setEditing(false);
      setMessage('Profile updated successfully! ✓');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError('Failed to update profile');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="card border-0 shadow-lg">
            <div className="card-header bg-primary text-white p-4">
              <div className="d-flex align-items-center">
                <div 
                  className="rounded-circle bg-white text-primary d-flex align-items-center justify-content-center me-3"
                  style={{ width: '60px', height: '60px', fontSize: '2rem' }}
                >
                  {user?.name?.charAt(0).toUpperCase() || '👤'}
                </div>
                <div>
                  <h1 className="h4 mb-0">My Profile</h1>
                  <p className="mb-0 small">Manage your account information</p>
                </div>
              </div>
            </div>

            <div className="card-body p-5">
              {message && (
                <div className="alert alert-success" role="alert">
                  {message}
                </div>
              )}

              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}

              {!editing ? (
                <div>
                  {/* View Mode */}
                  <div className="mb-4">
                    <h5 className="text-muted small mb-2">Full Name</h5>
                    <p className="h5">{user?.name || 'Not provided'}</p>
                  </div>

                  <div className="mb-4">
                    <h5 className="text-muted small mb-2">Email Address</h5>
                    <p className="h5">{user?.email || 'Not provided'}</p>
                  </div>

                  {user?.userType === 'practitioner' && (
                    <>
                      <div className="mb-4">
                        <h5 className="text-muted small mb-2">Specialization</h5>
                        <p className="h5">{user?.specialization || 'Not provided'}</p>
                      </div>

                      <div className="mb-4">
                        <h5 className="text-muted small mb-2">License Number</h5>
                        <p className="h5">{user?.licenseNumber || 'Not provided'}</p>
                      </div>
                    </>
                  )}

                  <div className="d-flex gap-2 mt-4">
                    <button 
                      className="btn btn-primary"
                      onClick={() => setEditing(true)}
                    >
                      Edit Profile
                    </button>
                    <button 
                      className="btn btn-outline-danger"
                      onClick={handleLogout}
                    >
                      Logout
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  {/* Edit Mode */}
                  <div className="mb-4">
                    <label htmlFor="name" className="form-label fw-bold">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      className="form-control form-control-lg"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      minLength="2"
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div className="mb-4">
                    <label htmlFor="email" className="form-label fw-bold">
                      Email Address
                    </label>
                    <input
                      type="email"
                      className="form-control form-control-lg"
                      id="email"
                      name="email"
                      value={formData.email}
                      disabled
                      readOnly
                    />
                    <small className="text-muted">Email cannot be changed</small>
                  </div>

                  <div className="d-flex gap-2">
                    <button type="submit" className="btn btn-success">
                      Save Changes
                    </button>
                    <button 
                      type="button" 
                      className="btn btn-outline-secondary"
                      onClick={() => {
                        setEditing(false);
                        setFormData({
                          name: user?.name || '',
                          email: user?.email || ''
                        });
                        setError('');
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;