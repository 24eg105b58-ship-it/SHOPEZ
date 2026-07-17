import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';

const ProductCard = ({ product }) => {
  const { user, toggleWishlist } = useContext(AuthContext);
  const { addToCart } = useContext(CartContext);

  const isWishlisted = user?.wishlist?.some(
    (item) => (item._id || item) === product._id
  );

  const handleWishlistClick = (e) => {
    e.preventDefault();
    if (!user) {
      alert('Please login to manage your wishlist!');
      return;
    }
    toggleWishlist(product._id);
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    if (product.stock === 0) return;
    addToCart(product._id, 1).then((res) => {
      if (!res.success) {
        alert(res.message);
      }
    });
  };

  // Calculate Average Rating
  const averageRating = product.reviews?.length
    ? (product.reviews.reduce((acc, r) => acc + r.rating, 0) / product.reviews.length).toFixed(1)
    : 0;

  return (
    <div className="card glass-card h-100 position-relative animate-fade-in">
      {/* Wishlist Icon Overlay */}
      <button
        onClick={handleWishlistClick}
        className="position-absolute top-0 end-0 m-3 btn p-0 border-0 bg-transparent text-light"
        style={{ zIndex: 10 }}
      >
        <i
          className={`bi ${isWishlisted ? 'bi-heart-fill active' : 'bi-heart'} wishlist-heart`}
        ></i>
      </button>

      <Link to={`/product/${product._id}`} className="text-decoration-none text-light">
        <div style={{ height: '200px', overflow: 'hidden' }} className="bg-dark d-flex align-items-center justify-content-center">
          <img
            src={product.image}
            alt={product.name}
            className="w-100 h-100 object-fit-cover transition"
            style={{ transition: 'transform 0.3s ease' }}
            onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
            onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1.0)')}
            onError={(e) => {
              e.currentTarget.src = 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=600&auto=format&fit=crop&q=60';
            }}
          />
        </div>
      </Link>

      <div className="card-body d-flex flex-column p-3">
        <div className="d-flex justify-content-between align-items-center mb-1">
          <span className="badge badge-glow-primary rounded-pill text-uppercase" style={{ fontSize: '0.7rem' }}>
            {product.category}
          </span>
          <span className="text-muted" style={{ fontSize: '0.85rem' }}>
            {product.stock > 0 ? (
              <span className="text-success"><i className="bi bi-check-circle me-1"></i>In Stock</span>
            ) : (
              <span className="text-danger"><i className="bi bi-x-circle me-1"></i>Out of Stock</span>
            )}
          </span>
        </div>

        <Link to={`/product/${product._id}`} className="text-decoration-none text-light">
          <h5 className="card-title text-truncate fw-bold mb-2">{product.name}</h5>
        </Link>

        {/* Ratings */}
        <div className="d-flex align-items-center gap-1 mb-2 text-warning">
          <div className="d-flex gap-1" style={{ fontSize: '0.85rem' }}>
            {[1, 2, 3, 4, 5].map((star) => (
              <i
                key={star}
                className={`bi ${
                  averageRating >= star
                    ? 'bi-star-fill'
                    : averageRating >= star - 0.5
                    ? 'bi-star-half'
                    : 'bi-star'
                }`}
              ></i>
            ))}
          </div>
          <span className="text-muted ms-1" style={{ fontSize: '0.8rem' }}>
            ({product.reviews?.length || 0})
          </span>
        </div>

        <p className="card-text text-muted text-truncate-3-lines mb-3" style={{ fontSize: '0.9rem', height: '40px', overflow: 'hidden' }}>
          {product.description}
        </p>

        <div className="mt-auto pt-2 d-flex justify-content-between align-items-center">
          <span className="fs-5 fw-bold text-light">₹{product.price.toLocaleString('en-IN')}</span>
          <button
            onClick={handleAddToCart}
            className="btn btn-glow btn-sm d-flex align-items-center gap-1"
            disabled={product.stock === 0}
          >
            <i className="bi bi-cart-plus"></i>
            <span>Add</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
