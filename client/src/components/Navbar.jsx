import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const { getCartCount } = useContext(CartContext);
  const [keyword, setKeyword] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (keyword.trim()) {
      navigate(`/?search=${keyword}`);
    } else {
      navigate('/');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark glass-navbar sticky-top">
      <div className="container">
        <Link className="navbar-brand d-flex align-items-center gap-2" to="/">
          <span className="fs-3 fw-bold gradient-text">SHOPEZ</span>
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarContent"
          aria-controls="navbarContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarContent">
          {/* Search Bar */}
          <form className="d-flex mx-auto col-lg-5 my-2 my-lg-0" onSubmit={handleSearch}>
            <div className="input-group">
              <input
                type="text"
                className="form-control form-glass text-light"
                placeholder="Search products, brands..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
              />
              <button className="btn btn-glow" type="submit">
                <i className="bi bi-search"></i>
              </button>
            </div>
          </form>

          {/* Nav Links */}
          <ul className="navbar-nav ms-auto align-items-lg-center gap-3">
            <li className="nav-item">
              <Link className="nav-link" to="/">
                Home
              </Link>
            </li>

            {user && (
              <li className="nav-item">
                <Link className="nav-link d-flex align-items-center gap-1" to="/wishlist">
                  <i className="bi bi-heart"></i>
                  <span>Wishlist</span>
                  {user.wishlist?.length > 0 && (
                    <span className="badge badge-glow-danger rounded-pill">
                      {user.wishlist.length}
                    </span>
                  )}
                </Link>
              </li>
            )}

            <li className="nav-item">
              <Link className="nav-link d-flex align-items-center gap-1 position-relative me-2" to="/cart">
                <i className="bi bi-cart3 fs-5"></i>
                <span className="d-lg-none">Cart</span>
                {getCartCount() > 0 && (
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                    {getCartCount()}
                  </span>
                )}
              </Link>
            </li>

            {user ? (
              <li className="nav-item dropdown">
                <a
                  className="nav-link dropdown-toggle btn-outline-glow text-light px-3 py-1 d-inline-flex align-items-center gap-1"
                  href="#"
                  id="navbarDropdown"
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <i className="bi bi-person-circle"></i>
                  <span>{user.name}</span>
                </a>
                <ul className="dropdown-menu dropdown-menu-end glass-card border border-secondary shadow-lg mt-2 p-2" aria-labelledby="navbarDropdown" style={{ backgroundColor: 'rgba(15, 23, 42, 0.95)' }}>
                  <li>
                    <Link className="dropdown-item text-light rounded py-2" to="/profile">
                      <i className="bi bi-person me-2 text-primary"></i>My Profile
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item text-light rounded py-2" to="/orders">
                      <i className="bi bi-bag me-2 text-success"></i>My Orders
                    </Link>
                  </li>
                  {user.role === 'admin' && (
                    <>
                      <li><hr className="dropdown-divider bg-secondary" /></li>
                      <li>
                        <Link className="dropdown-item text-light rounded py-2 fw-semibold" to="/admin">
                          <i className="bi bi-speedometer2 me-2 text-warning"></i>Admin Panel
                        </Link>
                      </li>
                    </>
                  )}
                  <li><hr className="dropdown-divider bg-secondary" /></li>
                  <li>
                    <button className="dropdown-item text-danger rounded py-2" onClick={handleLogout}>
                      <i className="bi bi-box-arrow-right me-2"></i>Logout
                    </button>
                  </li>
                </ul>
              </li>
            ) : (
              <li className="nav-item d-flex gap-2">
                <Link className="btn btn-outline-glow py-1 px-3" to="/login">
                  Login
                </Link>
                <Link className="btn btn-glow py-1 px-3" to="/register">
                  Register
                </Link>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
