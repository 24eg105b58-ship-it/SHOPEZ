import React, { useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import ProductCard from '../components/ProductCard';

const Wishlist = () => {
  const { user, refreshUser } = useContext(AuthContext);

  useEffect(() => {
    refreshUser();
  }, []);

  return (
    <div className="container py-5 animate-fade-in">
      <div className="d-flex justify-content-between align-items-center mb-5">
        <h1 className="fw-bold mb-0">My Wishlist</h1>
        <Link to="/" className="btn btn-outline-glow btn-sm">
          Continue Shopping
        </Link>
      </div>

      {!user?.wishlist || user.wishlist.length === 0 ? (
        <div className="card glass-panel p-5 text-center col-12 col-md-8 col-lg-6 mx-auto shadow-lg">
          <div className="fs-1 text-muted mb-3">
            <i className="bi bi-heartbreak"></i>
          </div>
          <h2 className="fw-bold mb-3">Your Wishlist is Empty</h2>
          <p className="text-muted mb-4">
            Browse our catalog and tap the heart icon on any product to save it here for later.
          </p>
          <Link to="/" className="btn btn-glow px-4 py-3">
            Explore Collection
          </Link>
        </div>
      ) : (
        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 row-cols-xl-4 g-4 animate-fade-in">
          {user.wishlist.map((product) => (
            <div className="col" key={product._id}>
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
