import React, { useState, useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import API from '../services/api';

const Profile = () => {
  const { user, updateProfile, refreshUser, toggleWishlist } = useContext(AuthContext);
  const { addToCart } = useContext(CartContext);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(false);

  // Sync state with user profile
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
    }
  }, [user]);

  // Refresh user data (for wishlist population) on mount
  useEffect(() => {
    refreshUser();
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!name || !email) {
      setError('Name and Email are required.');
      return;
    }

    if (password && password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setError('');
    setMessage('');
    setUpdating(true);

    const updateData = { name, email };
    if (password) updateData.password = password;

    const res = await updateProfile(updateData);
    setUpdating(false);

    if (res.success) {
      setMessage('Profile updated successfully!');
      setPassword('');
      setConfirmPassword('');
    } else {
      setError(res.message);
    }
  };

  const handleRemoveWishlist = async (productId) => {
    await toggleWishlist(productId);
  };

  const handleAddWishlistToCart = async (productId) => {
    const res = await addToCart(productId, 1);
    if (res.success) {
      alert('Added to cart!');
    } else {
      alert(res.message);
    }
  };

  return (
    <div className="container py-5 animate-fade-in">
      <div className="row g-5">
        {/* Profile Edit Column */}
        <div className="col-12 col-lg-5">
          <div className="card glass-panel p-4 shadow-lg">
            <h3 className="fw-bold mb-4">My Account Details</h3>

            {error && (
              <div className="alert alert-danger badge-glow-danger border-0 p-2 py-3 mb-3" role="alert">
                <i className="bi bi-exclamation-triangle me-2"></i>{error}
              </div>
            )}
            {message && (
              <div className="alert alert-success badge-glow-success border-0 p-2 py-3 mb-3" role="alert">
                <i className="bi bi-check-circle me-2"></i>{message}
              </div>
            )}

            <form onSubmit={handleUpdateProfile}>
              <div className="mb-3">
                <label className="form-label text-light fw-medium">Full Name</label>
                <input
                  type="text"
                  className="form-control form-glass"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label text-light fw-medium">Email Address</label>
                <input
                  type="email"
                  className="form-control form-glass"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label text-light fw-medium">New Password (leave blank to keep current)</label>
                <input
                  type="password"
                  className="form-control form-glass"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div className="mb-4">
                <label className="form-label text-light fw-medium">Confirm New Password</label>
                <input
                  type="password"
                  className="form-control form-glass"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="btn btn-glow w-100 py-3 d-flex align-items-center justify-content-center gap-2"
                disabled={updating}
              >
                {updating && <span className="spinner-border spinner-border-sm" role="status"></span>}
                <i className="bi bi-pencil-square"></i>
                <span>{updating ? 'Updating...' : 'Update Settings'}</span>
              </button>
            </form>
          </div>
        </div>

        {/* Wishlist Column */}
        <div className="col-12 col-lg-7">
          <div className="card glass-panel p-4 shadow-lg h-100">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h3 className="fw-bold mb-0">My Wishlist</h3>
              <span className="badge badge-glow-primary rounded-pill">
                {user?.wishlist?.length || 0} items
              </span>
            </div>

            {!user?.wishlist || user.wishlist.length === 0 ? (
              <div className="d-flex flex-column align-items-center justify-content-center text-center text-muted h-75 p-5">
                <i className="bi bi-heartbreak fs-1 mb-3"></i>
                <p>Your wishlist is currently empty.</p>
                <Link to="/" className="btn btn-outline-glow btn-sm mt-2">
                  Browse Products
                </Link>
              </div>
            ) : (
              <div className="d-flex flex-column gap-3 overflow-auto" style={{ maxHeight: '550px' }}>
                {user.wishlist.map((item) => (
                  <div
                    key={item._id}
                    className="row g-3 align-items-center p-3 rounded-3 border"
                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)', borderColor: 'var(--border-color)' }}
                  >
                    {/* Image */}
                    <div className="col-3 col-sm-2">
                      <div className="bg-dark rounded overflow-hidden" style={{ height: '60px', width: '60px' }}>
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-100 h-100 object-fit-cover"
                          onError={(e) => {
                            e.currentTarget.src = 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=600&auto=format&fit=crop&q=60';
                          }}
                        />
                      </div>
                    </div>

                    {/* Metadata */}
                    <div className="col-9 col-sm-5">
                      <Link to={`/product/${item._id}`} className="text-decoration-none text-light">
                        <h6 className="fw-bold mb-1 text-truncate">{item.name}</h6>
                      </Link>
                      <span className="fw-bold text-light">₹{item.price?.toLocaleString('en-IN')}</span>
                    </div>

                    {/* Actions */}
                    <div className="col-12 col-sm-5 d-flex gap-2 justify-content-sm-end pt-2 pt-sm-0">
                      <button
                        onClick={() => handleAddWishlistToCart(item._id)}
                        className="btn btn-glow btn-sm py-2 px-3 d-flex align-items-center gap-1"
                        disabled={item.stock === 0}
                      >
                        <i className="bi bi-cart-plus"></i>
                        <span>Cart</span>
                      </button>
                      <button
                        onClick={() => handleRemoveWishlist(item._id)}
                        className="btn btn-outline-danger btn-sm py-2 px-3"
                        title="Remove from wishlist"
                      >
                        <i className="bi bi-heart-fill"></i>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
