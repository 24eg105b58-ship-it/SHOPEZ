import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { CartContext } from '../context/CartContext';

const Cart = () => {
  const {
    cartItems,
    loading,
    updateQuantity,
    removeFromCart,
    clearCart,
    getCartTotal,
    getCartCount,
  } = useContext(CartContext);

  const handleQtyChange = (productId, newQty, stockLimit) => {
    if (newQty < 1) return;
    if (newQty > stockLimit) {
      alert(`Only ${stockLimit} units available in stock.`);
      return;
    }
    updateQuantity(productId, newQty);
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

  if (cartItems.length === 0) {
    return (
      <div className="container py-5 d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '65vh' }}>
        <div className="card glass-panel p-5 text-center col-12 col-md-8 col-lg-6 shadow-lg animate-fade-in">
          <div className="fs-1 text-muted mb-3">
            <i className="bi bi-cart-x"></i>
          </div>
          <h2 className="fw-bold mb-3">Your Cart is Empty</h2>
          <p className="text-muted mb-4">
            Looks like you haven't added anything to your cart yet. Browse our selection and find the best items for you!
          </p>
          <Link to="/" className="btn btn-glow px-4 py-3">
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5 animate-fade-in">
      <h1 className="fw-bold mb-5">Shopping Cart</h1>

      <div className="row g-4">
        {/* Cart items list */}
        <div className="col-12 col-lg-8">
          <div className="card glass-panel p-4 shadow-sm">
            <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3" style={{ borderColor: 'var(--border-color)' }}>
              <span className="fw-bold text-light mb-0">{getCartCount()} items in your cart</span>
              <button onClick={clearCart} className="btn btn-sm btn-outline-danger px-3 py-1">
                <i className="bi bi-trash3 me-1"></i>Clear Cart
              </button>
            </div>

            <div className="d-flex flex-column gap-3">
              {cartItems.map((item) => {
                const product = item.productId;
                if (!product) return null;

                return (
                  <div
                    key={item._id || product._id}
                    className="row g-3 align-items-center p-3 rounded-3 border"
                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)', borderColor: 'var(--border-color)' }}
                  >
                    {/* Image */}
                    <div className="col-3 col-sm-2">
                      <div className="bg-dark rounded-2 overflow-hidden" style={{ height: '70px', width: '70px' }}>
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-100 h-100 object-fit-cover"
                          onError={(e) => {
                            e.currentTarget.src = 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=600&auto=format&fit=crop&q=60';
                          }}
                        />
                      </div>
                    </div>

                    {/* Title & Category */}
                    <div className="col-9 col-sm-4">
                      <Link to={`/product/${product._id}`} className="text-decoration-none text-light">
                        <h6 className="fw-bold mb-1 text-truncate">{product.name}</h6>
                      </Link>
                      <span className="badge badge-glow-primary rounded-pill text-uppercase" style={{ fontSize: '0.65rem' }}>
                        {product.category}
                      </span>
                    </div>

                    {/* Quantity Controls */}
                    <div className="col-6 col-sm-3 d-flex align-items-center gap-2">
                      <button
                        onClick={() => handleQtyChange(product._id, item.quantity - 1, product.stock)}
                        className="btn btn-sm btn-outline-secondary py-1 px-2 border-secondary text-light"
                      >
                        <i className="bi bi-dash"></i>
                      </button>
                      <span className="fw-bold text-light px-2">{item.quantity}</span>
                      <button
                        onClick={() => handleQtyChange(product._id, item.quantity + 1, product.stock)}
                        className="btn btn-sm btn-outline-secondary py-1 px-2 border-secondary text-light"
                      >
                        <i className="bi bi-plus"></i>
                      </button>
                    </div>

                    {/* Price and delete button */}
                    <div className="col-6 col-sm-3 text-end d-flex align-items-center justify-content-end gap-3">
                      <div>
                        <span className="fw-bold text-light d-block">₹{(product.price * item.quantity).toLocaleString('en-IN')}</span>
                        <small className="text-muted">₹{product.price.toLocaleString('en-IN')} each</small>
                      </div>
                      <button
                        onClick={() => removeFromCart(product._id)}
                        className="btn btn-sm text-danger border-0 bg-transparent p-1"
                        title="Remove product"
                      >
                        <i className="bi bi-x-circle fs-5"></i>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="col-12 col-lg-4">
          <div className="card glass-panel p-4 shadow-sm sticky-top" style={{ top: '90px' }}>
            <h4 className="fw-bold mb-4">Summary</h4>

            <div className="d-flex justify-content-between mb-3 text-muted">
              <span>Subtotal</span>
              <span className="text-light">₹{getCartTotal().toLocaleString('en-IN')}</span>
            </div>
            <div className="d-flex justify-content-between mb-3 text-muted">
              <span>Estimated Shipping</span>
              <span className="text-success fw-semibold">FREE</span>
            </div>
            <hr style={{ borderColor: 'var(--border-color)' }} />
            <div className="d-flex justify-content-between mb-4">
              <span className="fw-bold fs-5">Total Price</span>
              <span className="fw-bold fs-5 gradient-text">₹{getCartTotal().toLocaleString('en-IN')}</span>
            </div>

            <Link to="/checkout" className="btn btn-glow w-100 py-3 mb-3 d-flex align-items-center justify-content-center gap-2">
              <span>Proceed to Checkout</span>
              <i className="bi bi-arrow-right-short fs-5"></i>
            </Link>

            <Link to="/" className="btn btn-outline-glow w-100 py-3">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
