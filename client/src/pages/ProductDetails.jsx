import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import API from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { user, toggleWishlist } = useContext(AuthContext);
  const { addToCart } = useContext(CartContext);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);

  // Review states
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const fetchProduct = async () => {
    try {
      const { data } = await API.get(`/products/${id}`);
      if (data.success) {
        setProduct(data.product);
      } else {
        setError('Product not found');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load product details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const handleWishlistToggle = () => {
    if (!user) {
      alert('Please login to manage your wishlist!');
      return;
    }
    toggleWishlist(product._id);
  };

  const handleAddToCart = () => {
    if (product.stock === 0) return;
    addToCart(product._id, quantity).then((res) => {
      if (res.success) {
        alert('Product added to cart!');
      } else {
        alert(res.message);
      }
    });
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      setReviewError('Please write a comment');
      return;
    }

    setReviewError('');
    setReviewSuccess('');
    setSubmittingReview(true);

    try {
      const { data } = await API.post(`/products/${id}/review`, { rating, comment });
      if (data.success) {
        setReviewSuccess('Review submitted successfully!');
        setComment('');
        setRating(5);
        fetchProduct(); // Refresh product reviews
      }
    } catch (err) {
      setReviewError(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container py-5 text-center">
        <div className="alert alert-danger bg-danger text-white border-0 py-4 mb-4">
          <h4>Error Loading Product</h4>
          <p className="mb-0">{error || 'The requested product could not be found.'}</p>
        </div>
        <Link to="/" className="btn btn-glow">Back to Home</Link>
      </div>
    );
  }

  const isWishlisted = user?.wishlist?.some(
    (item) => (item._id || item) === product._id
  );

  const averageRating = product.reviews?.length
    ? (product.reviews.reduce((acc, r) => acc + r.rating, 0) / product.reviews.length).toFixed(1)
    : 0;

  return (
    <div className="container py-5 animate-fade-in">
      {/* Back button */}
      <Link to="/" className="btn btn-outline-glow btn-sm mb-4">
        <i className="bi bi-arrow-left me-2"></i>Back to Browse
      </Link>

      <div className="row g-5">
        {/* Product Image */}
        <div className="col-12 col-md-6">
          <div className="card glass-panel p-2 shadow-lg overflow-hidden" style={{ minHeight: '400px' }}>
            <img
              src={product.image}
              alt={product.name}
              className="w-100 h-100 rounded-3 object-fit-contain"
              style={{ maxHeight: '500px' }}
              onError={(e) => {
                e.currentTarget.src = 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=600&auto=format&fit=crop&q=60';
              }}
            />
          </div>
        </div>

        {/* Product Details */}
        <div className="col-12 col-md-6 d-flex flex-column justify-content-between">
          <div>
            <div className="d-flex justify-content-between align-items-start mb-3">
              <span className="badge badge-glow-primary px-3 py-2 rounded-pill text-uppercase">
                {product.category}
              </span>
              <button
                onClick={handleWishlistToggle}
                className="btn btn-outline-glow rounded-circle p-2 d-flex align-items-center justify-content-center"
                style={{ width: '40px', height: '40px' }}
              >
                <i className={`bi ${isWishlisted ? 'bi-heart-fill text-danger' : 'bi-heart'}`}></i>
              </button>
            </div>

            <h1 className="fw-bold text-light mb-2">{product.name}</h1>

            {/* Ratings Summary */}
            <div className="d-flex align-items-center gap-2 mb-4">
              <div className="text-warning d-flex gap-1">
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
              <span className="fw-semibold text-light ms-1" style={{ fontSize: '0.95rem' }}>
                {averageRating} ({product.reviews?.length || 0} reviews)
              </span>
            </div>

            <h2 className="gradient-text fw-bold mb-4">₹{product.price.toLocaleString('en-IN')}</h2>

            <hr style={{ borderColor: 'var(--border-color)' }} />

            <h5 className="fw-semibold text-light mb-2">Description</h5>
            <p className="text-muted leading-relaxed mb-4">{product.description}</p>

            <div className="mb-4">
              <span className="fw-semibold text-light d-block mb-2">Availability:</span>
              {product.stock > 0 ? (
                <span className="badge badge-glow-success px-3 py-2 fs-6">
                  <i className="bi bi-check-circle me-1"></i>{product.stock} Units In Stock
                </span>
              ) : (
                <span className="badge badge-glow-danger px-3 py-2 fs-6">
                  <i className="bi bi-x-circle me-1"></i>Out of Stock
                </span>
              )}
            </div>
          </div>

          {product.stock > 0 && (
            <div className="card glass-panel p-3 border-secondary mb-4">
              <div className="row align-items-center g-3">
                <div className="col-12 col-sm-4">
                  <label className="form-label text-light fw-medium mb-1 mb-sm-0">Select Quantity</label>
                  <select
                    className="form-select form-glass"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                  >
                    {[...Array(Math.min(product.stock, 10)).keys()].map((x) => (
                      <option key={x + 1} value={x + 1}>
                        {x + 1}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-12 col-sm-8 pt-3 pt-sm-0">
                  <button onClick={handleAddToCart} className="btn btn-glow w-100 py-3 d-flex align-items-center justify-content-center gap-2">
                    <i className="bi bi-cart-plus fs-5"></i>
                    <span>Add To Shopping Cart</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <hr className="my-5" style={{ borderColor: 'var(--border-color)' }} />

      {/* Reviews Section */}
      <div className="row g-4">
        {/* View Reviews */}
        <div className="col-12 col-lg-7">
          <h3 className="fw-bold mb-4">Customer Reviews</h3>
          {product.reviews.length === 0 ? (
            <div className="card glass-panel p-5 text-center text-muted">
              <i className="bi bi-chat-left-text fs-2 mb-3"></i>
              <p className="mb-0">No reviews yet for this product. Be the first to share your thoughts!</p>
            </div>
          ) : (
            <div className="d-flex flex-column gap-3">
              {product.reviews.map((rev) => (
                <div key={rev._id} className="card glass-card p-3 border-secondary">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="fw-bold text-light">{rev.name}</span>
                    <span className="text-muted" style={{ fontSize: '0.85rem' }}>
                      {new Date(rev.date).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                  <div className="text-warning d-flex gap-1 mb-2" style={{ fontSize: '0.85rem' }}>
                    {[...Array(5)].map((_, i) => (
                      <i key={i} className={`bi ${rev.rating > i ? 'bi-star-fill' : 'bi-star'}`}></i>
                    ))}
                  </div>
                  <p className="mb-0 text-muted" style={{ fontSize: '0.95rem' }}>
                    {rev.comment}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit Review */}
        <div className="col-12 col-lg-5">
          <div className="card glass-panel p-4 shadow-sm">
            <h4 className="fw-bold mb-3">Write a Review</h4>
            {user ? (
              <form onSubmit={handleReviewSubmit}>
                {reviewError && (
                  <div className="alert alert-danger badge-glow-danger border-0 p-2 py-2 mb-3" role="alert">
                    {reviewError}
                  </div>
                )}
                {reviewSuccess && (
                  <div className="alert alert-success badge-glow-success border-0 p-2 py-2 mb-3" role="alert">
                    {reviewSuccess}
                  </div>
                )}

                <div className="mb-3">
                  <label className="form-label text-light fw-medium">Rating</label>
                  <select
                    className="form-select form-glass"
                    value={rating}
                    onChange={(e) => setRating(Number(e.target.value))}
                  >
                    <option value="5">5 Stars - Excellent</option>
                    <option value="4">4 Stars - Very Good</option>
                    <option value="3">3 Stars - Good</option>
                    <option value="2">2 Stars - Fair</option>
                    <option value="1">1 Star - Poor</option>
                  </select>
                </div>

                <div className="mb-4">
                  <label className="form-label text-light fw-medium">Your Comment</label>
                  <textarea
                    className="form-control form-glass"
                    rows="4"
                    placeholder="Share your experience with this product..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    required
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="btn btn-glow w-100 py-3 d-flex align-items-center justify-content-center gap-2"
                  disabled={submittingReview}
                >
                  {submittingReview && <span className="spinner-border spinner-border-sm" role="status"></span>}
                  <span>Submit Feedback</span>
                </button>
              </form>
            ) : (
              <div className="text-center py-4 text-muted">
                <p>Please log in to write reviews for this product.</p>
                <Link to={`/login?redirect=/product/${product._id}`} className="btn btn-outline-glow btn-sm mt-1">
                  Sign In to Review
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
