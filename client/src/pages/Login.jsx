import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login, user } = useContext(AuthContext);
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
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    setError('');
    setSubmitting(true);

    const res = await login(email, password);
    setSubmitting(false);

    if (res.success) {
      navigate(redirect);
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="container py-5 d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
      <div className="card glass-panel p-4 p-md-5 col-12 col-md-6 col-lg-5 animate-fade-in shadow-lg">
        <div className="text-center mb-4">
          <h2 className="fw-bold mb-2">Welcome Back</h2>
          <p className="text-muted">Login to explore your account details and orders</p>
        </div>

        {error && (
          <div className="alert alert-danger badge-glow-danger border-0 mb-4 py-3" role="alert">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label text-light fw-medium">Email Address</label>
            <div className="input-group">
              <span className="input-group-text bg-transparent border-end-0 text-muted" style={{ borderColor: 'var(--glass-border)' }}>
                <i className="bi bi-envelope"></i>
              </span>
              <input
                type="email"
                className="form-control form-glass border-start-0"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="form-label text-light fw-medium">Password</label>
            <div className="input-group">
              <span className="input-group-text bg-transparent border-end-0 text-muted" style={{ borderColor: 'var(--glass-border)' }}>
                <i className="bi bi-lock"></i>
              </span>
              <input
                type="password"
                className="form-control form-glass border-start-0"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
              <i className="bi bi-box-arrow-in-right"></i>
            )}
            <span>{submitting ? 'Signing in...' : 'Sign In'}</span>
          </button>
        </form>

        <div className="text-center mt-3">
          <span className="text-muted">New to SHOPEZ? </span>
          <Link to={`/register?redirect=${redirect}`} className="gradient-text fw-bold text-decoration-none">
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
