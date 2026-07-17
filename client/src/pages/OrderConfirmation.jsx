import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../services/api';

const OrderConfirmation = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const { data } = await API.get('/orders/my-orders');
        if (data.success) {
          const foundOrder = data.orders.find((o) => o._id === id);
          if (foundOrder) {
            setOrder(foundOrder);
          } else {
            setError('Order details could not be found.');
          }
        }
      } catch (err) {
        setError('Failed to retrieve order confirmation details.');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container py-5 text-center">
        <div className="alert alert-danger bg-danger text-white border-0 py-4 mb-4">
          <h4>Order Processing Warning</h4>
          <p className="mb-0">{error || 'Unable to retrieve invoice metrics.'}</p>
        </div>
        <Link to="/" className="btn btn-glow">Return to Catalog</Link>
      </div>
    );
  }

  return (
    <div className="container py-5 d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
      <div className="card glass-panel p-4 p-md-5 col-12 col-md-10 col-lg-8 animate-fade-in shadow-2xl">
        <div className="text-center mb-5">
          <div className="display-1 text-success mb-3 animate-bounce">
            <i className="bi bi-patch-check-fill"></i>
          </div>
          <h2 className="fw-bold mb-2">Order Confirmed!</h2>
          <p className="text-muted">Thank you for shopping with SHOPEZ. Your transaction was processed successfully.</p>
          <span className="badge badge-glow-success px-3 py-2 fs-6 mt-1">
            Order Reference: #{order._id}
          </span>
        </div>

        <div className="row g-4 mb-4">
          {/* Address Details */}
          <div className="col-12 col-md-6">
            <div className="p-3 rounded-3 h-100" style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--glass-border)' }}>
              <h5 className="fw-bold text-light mb-3"><i className="bi bi-geo-alt me-2 text-primary"></i>Delivery Destination</h5>
              <p className="mb-1 text-light">{order.shippingAddress.address}</p>
              <p className="mb-1 text-light">{order.shippingAddress.city} - {order.shippingAddress.postalCode}</p>
              <p className="mb-0 text-muted" style={{ fontSize: '0.9rem' }}>Contact Phone: {order.shippingAddress.phone}</p>
            </div>
          </div>

          {/* Payment Details */}
          <div className="col-12 col-md-6">
            <div className="p-3 rounded-3 h-100" style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--glass-border)' }}>
              <h5 className="fw-bold text-light mb-3"><i className="bi bi-credit-card me-2 text-success"></i>Transaction Details</h5>
              <p className="mb-1 text-light"><strong>Status:</strong> <span className="text-success fw-bold">PAID</span></p>
              <p className="mb-1 text-light"><strong>Payment ID:</strong> {order.paymentDetails?.paymentId || 'N/A'}</p>
              <p className="mb-0 text-muted" style={{ fontSize: '0.9rem' }}>Order Date: {new Date(order.orderDate).toLocaleString('en-IN')}</p>
            </div>
          </div>
        </div>

        {/* Products List */}
        <div className="card glass-card border-secondary mb-5 p-3">
          <h5 className="fw-bold mb-3">Items Summary</h5>
          <div className="d-flex flex-column gap-3">
            {order.products.map((item) => (
              <div key={item._id} className="d-flex justify-content-between align-items-center">
                <div className="col-8 p-0 text-truncate">
                  <span className="fw-medium text-light text-truncate d-block">{item.productId?.name || 'Deleted Product'}</span>
                  <small className="text-muted">Quantity: {item.quantity} @ ₹{item.price.toLocaleString('en-IN')} each</small>
                </div>
                <span className="fw-bold text-light col-4 p-0 text-end">
                  ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                </span>
              </div>
            ))}
            <hr style={{ borderColor: 'var(--border-color)' }} />
            <div className="d-flex justify-content-between">
              <span className="fw-bold fs-5 text-light">Grand Total Price</span>
              <span className="fw-bold fs-5 gradient-text">₹{order.totalAmount.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        <div className="d-flex flex-wrap justify-content-center gap-3">
          <Link to="/" className="btn btn-glow px-4 py-3">
            Browse More Products
          </Link>
          <Link to="/orders" className="btn btn-outline-glow px-4 py-3">
            View Order History
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;
