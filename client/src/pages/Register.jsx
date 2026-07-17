import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { register, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const redirect = new URLSearchParams(location.search).get('redirect') || '/';

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate(redirect);
    }
  }, [user, navigate, redirect]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setError('');
    setSubmitting(true);

    const res = await register(name, email, password);
    setSubmitting(false);

    if (res.success) {
      navigate(redirect);
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="container py-5 d-flex justify-content-center align-items-center" style={{ minHeight: '85vh' }}>
      <div className="card glass-panel p-4 p-md-5 col-12 col-md-6 col-lg-5 animate-fade-in shadow-lg">
        <div className="text-center mb-4">
          <h2 className="fw-bold mb-2">Create Account</h2>
          <p className="text-muted">Register to start shopping and tracking orders</p>
        </div>

        {error && (
          <div className="alert alert-danger badge-glow-danger border-0 mb-4 py-3" role="alert">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label text-light fw-medium">Full Name</label>
            <div className="input-group">
              <span className="input-group-text bg-transparent border-end-0 text-muted" style={{ borderColor: 'var(--glass-border)' }}>
                <i className="bi bi-person"></i>
              </span>
              <input
                type="text"
                className="form-control form-glass border-start-0"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label text-light fw-medium">Email Address</label>
            <div className="input-group">
              <span className="input-group-text bg-transparent border-end-0 text-muted" style={{ borderColor: 'var(--glass-border)' }}>
                <i className="bi bi-envelope"></i>
              </span>
              <input
                type="email"
                className="form-control form-glass border-start-0"
                placeholder="john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label text-light fw-medium">Password</label>
            <div className="input-group">
              <span className="input-group-text bg-transparent border-end-0 text-muted" style={{ borderColor: 'var(--glass-border)' }}>
                <i className="bi bi-lock"></i>
              </span>
              <input
                type="password"
                className="form-control form-glass border-start-0"
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="form-label text-light fw-medium">Confirm Password</label>
            <div className="input-group">
              <span className="input-group-text bg-transparent border-end-0 text-muted" style={{ borderColor: 'var(--glass-border)' }}>
                <i className="bi bi-lock-fill"></i>
              </span>
              <input
                type="password"
                className="form-control form-glass border-start-0"
                placeholder="Re-enter password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-glow w-100 py-3 mb-3 d-flex align-items-center justify-content-center gap-2"
            disabled={submitting}
          >
            {submitting ? (
              <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
            ) : (
              <i className="bi bi-person-plus"></i>
            )}
            <span>{submitting ? 'Creating account...' : 'Create Account'}</span>
          </button>
        </form>

        <div className="text-center mt-3">
          <span className="text-muted">Already have an account? </span>
          <Link to={`/login?redirect=${redirect}`} className="gradient-text fw-bold text-decoration-none">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
