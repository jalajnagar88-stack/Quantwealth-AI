import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Phone, Shield, Edit2, Check, X, Camera, Wallet } from 'lucide-react';
import './UserProfile.css';

const UserProfile = () => {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || '',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setSuccess(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const result = await updateProfile({
      firstName: formData.firstName,
      lastName: formData.lastName,
      phoneNumber: formData.phoneNumber,
    });

    if (result.success) {
      setSuccess(true);
      setIsEditing(false);
    }
    
    setLoading(false);
  };

  return (
    <div className="profile-page">
      <div className="profile-header">
        <h1>Profile Settings</h1>
        <p>Manage your account information and preferences</p>
      </div>

      <div className="profile-container">
        {/* Profile Card */}
        <div className="profile-card main">
          <div className="profile-avatar-section">
            <div className="avatar-container">
              <div className="profile-avatar">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </div>
              <button className="avatar-edit-btn">
                <Camera size={16} />
              </button>
            </div>
            <div className="profile-info">
              <h2>{user?.firstName} {user?.lastName}</h2>
              <p className="profile-email">{user?.email}</p>
              <div className="profile-badges">
                {user?.isEmailVerified && (
                  <span className="badge verified">
                    <Check size={14} />
                    Email Verified
                  </span>
                )}
                <span className={`badge ${user?.kycStatus === 'verified' ? 'verified' : 'pending'}`}>
                  <Shield size={14} />
                  KYC {user?.kycStatus === 'verified' ? 'Verified' : 'Pending'}
                </span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="profile-form">
            <div className="form-section">
              <div className="section-header">
                <h3>Personal Information</h3>
                {!isEditing ? (
                  <button 
                    type="button" 
                    className="edit-btn"
                    onClick={() => setIsEditing(true)}
                  >
                    <Edit2 size={16} />
                    Edit
                  </button>
                ) : (
                  <div className="edit-actions">
                    <button 
                      type="submit" 
                      className="save-btn"
                      disabled={loading}
                    >
                      <Check size={16} />
                      Save
                    </button>
                    <button 
                      type="button" 
                      className="cancel-btn"
                      onClick={() => {
                        setIsEditing(false);
                        setFormData({
                          firstName: user?.firstName || '',
                          lastName: user?.lastName || '',
                          email: user?.email || '',
                          phoneNumber: user?.phoneNumber || '',
                        });
                      }}
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}
              </div>

              {success && (
                <div className="success-message">
                  Profile updated successfully!
                </div>
              )}

              <div className="form-grid">
                <div className="form-group">
                  <label>
                    <User size={16} />
                    First Name
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                </div>

                <div className="form-group">
                  <label>
                    <User size={16} />
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                </div>

                <div className="form-group">
                  <label>
                    <Mail size={16} />
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    disabled
                  />
                </div>

                <div className="form-group">
                  <label>
                    <Phone size={16} />
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder="Add phone number"
                  />
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Connected Accounts */}
        <div className="profile-card">
          <div className="card-header">
            <h3>
              <Wallet size={20} />
              Connected DMAT Accounts
            </h3>
            <button className="add-btn">+ Connect</button>
          </div>
          <div className="connected-accounts">
            <div className="empty-state">
              <p>No DMAT accounts connected yet</p>
              <p className="sub-text">Connect your brokerage account to enable automated trading</p>
            </div>
          </div>
        </div>

        {/* Security */}
        <div className="profile-card">
          <div className="card-header">
            <h3>
              <Shield size={20} />
              Security
            </h3>
          </div>
          <div className="security-options">
            <div className="security-item">
              <div className="security-info">
                <h4>Password</h4>
                <p>Last changed 30 days ago</p>
              </div>
              <button className="action-btn">Change</button>
            </div>
            <div className="security-item">
              <div className="security-info">
                <h4>Two-Factor Authentication</h4>
                <p>Not enabled</p>
              </div>
              <button className="action-btn">Enable</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
