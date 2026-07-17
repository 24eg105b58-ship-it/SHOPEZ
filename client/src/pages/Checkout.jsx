import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import API from '../services/api';

const Checkout = () => {
  const { cartItems, getCartTotal, clearCart } = useContext(CartContext);
  const navigate = useNavigate();

  // Shipping states
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Simulated Checkout states
  const [showMockModal, setShowMockModal] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState('');
  const [mockPaymentDetails, setMockPaymentDetails] = useState(null);

  useEffect(() => {
    if (cartItems.length === 0 && !showMockModal) {
      navigate('/cart');
    }
  }, [cartItems, navigate, showMockModal]);

  // Dynamic Razorpay Script Loader
  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();
    if (!address || !city || !postalCode || !phone) {
      setError('Please provide complete shipping details.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const { data } = await API.post('/orders', {
        products: cartItems.map((item) => ({
          productId: item.productId._id,
          quantity: item.quantity,
        })),
        shippingAddress: { address, city, postalCode, phone },
      });

      if (data.success) {
        const { order, paymentOrder } = data;
        setCreatedOrderId(order._id);
        setMockPaymentDetails(paymentOrder);

        if (paymentOrder.mock) {
          // Trigger simulated checkout UI
          setShowMockModal(true);
          setLoading(false);
        } else {
          // Trigger actual Razorpay Checkout SDK
          const res = await loadRazorpay();
          if (!res) {
            alert('Razorpay SDK failed to load. Are you offline?');
            setLoading(false);
            return;
          }

          const options = {
            key: paymentOrder.key || 'rzp_test_placeholder', // Should be served by server
            amount: paymentOrder.amount,
            currency: paymentOrder.currency,
            name: 'SHOPEZ Store',
            description: 'Order Payment',
            order_id: paymentOrder.id,
            handler: async function (response) {
              try {
                const verifyRes = await API.post('/orders/verify', {
                  orderId: order._id,
                  razorpayOrderId: response.razorpay_order_id,
                  razorpayPaymentId: response.razorpay_payment_id,
                  razorpaySignature: response.razorpay_signature,
                });

                if (verifyRes.data.success) {
                  clearCart();
                  navigate(`/order-confirmation/${order._id}`);
                }
              } catch (err) {
                alert('Payment verification failed.');
              }
            },
            prefill: {
              contact: phone,
            },
            theme: {
              color: '#6366f1',
            },
          };

          const paymentObject = new window.Razorpay(options);
          paymentObject.open();
          setLoading(false);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to initialize order.');
      setLoading(false);
    }
  };

  const handleSimulatePayment = async (status) => {
    if (status === 'success') {
      setLoading(true);
      try {
        const { data } = await API.post('/orders/verify', {
          orderId: createdOrderId,
          razorpayOrderId: mockPaymentDetails.id,
          razorpayPaymentId: `mock_pay_${Math.random().toString(36).substring(2, 11)}`,
          razorpaySignature: 'mock_signature_123456',
        });

        if (data.success) {
          clearCart();
          setShowMockModal(false);
          navigate(`/order-confirmation/${createdOrderId}`);
        }
      } catch (err) {
        setError('Mock payment verification failed.');
      } finally {
        setLoading(false);
      }
    } else {
      // Simulate cancel/fail
      setShowMockModal(false);
      alert('Simulated payment cancelled. Order placed under Pending.');
      navigate('/orders');
    }
  };

  return (
    <div className="container py-5 animate-fade-in">
      <h1 className="fw-bold mb-5">Checkout</h1>

      {error && (
        <div className="alert alert-danger badge-glow-danger border-0 py-3 mb-4" role="alert">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {error}
        </div>
      )}

      <div className="row g-4">
        {/* Shipping Form */}
        <div className="col-12 col-lg-7">
          <div className="card glass-panel p-4 p-md-5 shadow-lg">
            <h4 className="fw-bold mb-4"><i className="bi bi-truck me-2 text-primary"></i>Shipping Information</h4>

            <form onSubmit={handleCheckoutSubmit}>
              <div className="mb-3">
                <label className="form-label text-light fw-medium">Street Address</label>
                <input
                  type="text"
                  className="form-control form-glass"
                  placeholder="Apartment, suite, unit, street address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                />
              </div>

              <div className="row g-3 mb-3">
                <div className="col-6">
                  <label className="form-label text-light fw-medium">City</label>
                  <input
                    type="text"
                    className="form-control form-glass"
                    placeholder="New Delhi"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    required
                  />
                </div>
                <div className="col-6">
                  <label className="form-label text-light fw-medium">Postal / ZIP Code</label>
                  <input
                    type="text"
                    className="form-control form-glass"
                    placeholder="110001"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="form-label text-light fw-medium">Contact Phone Number</label>
                <input
                  type="tel"
                  className="form-control form-glass"
                  placeholder="+91 9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn-glow w-100 py-3 d-flex align-items-center justify-content-center gap-2"
                disabled={loading}
              >
                {loading && <span className="spinner-border spinner-border-sm" role="status"></span>}
                <i className="bi bi-credit-card"></i>
                <span>{loading ? 'Processing Order...' : 'Pay with Razorpay'}</span>
              </button>
            </form>
          </div>
        </div>

        {/* Invoice Summary */}
        <div className="col-12 col-lg-5">
          <div className="card glass-panel p-4 shadow-lg sticky-top" style={{ top: '90px' }}>
            <h4 className="fw-bold mb-4">Invoice Summary</h4>

            <div className="d-flex flex-column gap-3 mb-4 max-height-300 overflow-auto pr-1">
              {cartItems.map((item) => (
                <div key={item._id} className="d-flex justify-content-between align-items-center">
                  <div className="text-truncate col-8 p-0">
                    <span className="text-light fw-medium d-block text-truncate">{item.productId.name}</span>
                    <small className="text-muted">Quantity: {item.quantity}</small>
                  </div>
                  <span className="fw-semibold text-light text-end col-4 p-0">
                    ₹{(item.productId.price * item.quantity).toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>

            <hr style={{ borderColor: 'var(--border-color)' }} />

            <div className="d-flex justify-content-between mb-3 text-muted">
              <span>Delivery Cost</span>
              <span className="text-success fw-semibold">FREE</span>
            </div>
            <div className="d-flex justify-content-between mb-4">
              <span className="fw-bold fs-5 text-light">Total Billing</span>
              <span className="fw-bold fs-5 gradient-text">₹{getCartTotal().toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Simulated Checkout Modal */}
      {showMockModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content glass-panel border border-secondary shadow-2xl p-4">
              <div className="modal-header border-0 pb-0 justify-content-center">
                <h4 className="modal-title fw-bold text-center gradient-text">
                  <i className="bi bi-shield-check me-2"></i>Razorpay Gateway Simulator
                </h4>
              </div>
              <div className="modal-body text-center py-4">
                <div className="alert badge-glow-primary border-0 p-3 mb-4">
                  <span className="d-block text-muted text-uppercase fw-bold mb-1" style={{ fontSize: '0.8rem' }}>Simulation Mode Enabled</span>
                  <p className="mb-0 text-light fw-medium">No real money will be charged for this transaction.</p>
                </div>

                <div className="d-flex flex-column gap-2 text-start p-3 rounded mb-4" style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid var(--glass-border)' }}>
                  <div className="d-flex justify-content-between">
                    <span className="text-muted">Transaction ID:</span>
                    <code className="text-light">{mockPaymentDetails?.id}</code>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span className="text-muted">Mongoose Order ID:</span>
                    <code className="text-light">{createdOrderId.substring(0, 12)}...</code>
                  </div>
                  <div className="d-flex justify-content-between border-top pt-2 mt-2" style={{ borderColor: 'var(--border-color)' }}>
                    <span className="fw-bold">Payable Amount:</span>
                    <span className="fw-bold text-success">₹{getCartTotal().toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <div className="d-flex flex-column gap-2">
                  <button
                    onClick={() => handleSimulatePayment('success')}
                    className="btn btn-glow py-3 d-flex align-items-center justify-content-center gap-2"
                    disabled={loading}
                  >
                    {loading && <span className="spinner-border spinner-border-sm" role="status"></span>}
                    <i className="bi bi-check-circle-fill"></i>
                    <span>Simulate Successful Payment</span>
                  </button>
                  <button
                    onClick={() => handleSimulatePayment('fail')}
                    className="btn btn-outline-danger py-2"
                    disabled={loading}
                  >
                    Decline Payment
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Checkout;
