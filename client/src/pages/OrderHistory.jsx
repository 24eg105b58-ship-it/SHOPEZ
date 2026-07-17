import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await API.get('/orders/my-orders');
        if (data.success) {
          setOrders(data.orders);
        }
      } catch (err) {
        setError('Failed to fetch order history.');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Paid':
        return 'badge-glow-success';
      case 'Pending':
        return 'badge-glow-primary';
      case 'Shipped':
        return 'badge-glow-info';
      case 'Delivered':
        return 'badge-glow-success';
      case 'Cancelled':
        return 'badge-glow-danger';
      default:
        return 'badge-glow-warning';
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

  return (
    <div className="container py-5 animate-fade-in">
      <h1 className="fw-bold mb-5">Order History</h1>

      {error && (
        <div className="alert alert-danger badge-glow-danger border-0 py-3 mb-4" role="alert">
          {error}
        </div>
      )}

      {orders.length === 0 ? (
        <div className="card glass-panel p-5 text-center col-12 col-md-8 col-lg-6 mx-auto shadow-lg animate-fade-in">
          <div className="fs-1 text-muted mb-3">
            <i className="bi bi-bag-x"></i>
          </div>
          <h2 className="fw-bold mb-3">No Orders Found</h2>
          <p className="text-muted mb-4">
            You haven't placed any orders yet. Start exploring our catalog to make your first purchase!
          </p>
          <Link to="/" className="btn btn-glow px-4 py-3">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="d-flex flex-column gap-4">
          {orders.map((order) => (
            <div key={order._id} className="card glass-card p-4 border-secondary shadow-md animate-fade-in">
              {/* Order Header Summary */}
              <div className="d-flex flex-wrap justify-content-between align-items-center border-bottom pb-3 mb-3" style={{ borderColor: 'var(--border-color)' }}>
                <div className="d-flex flex-wrap gap-3 gap-md-4">
                  <div>
                    <span className="text-muted d-block" style={{ fontSize: '0.85rem' }}>Order Reference</span>
                    <span className="fw-bold text-light" style={{ fontSize: '0.95rem' }}>#{order._id}</span>
                  </div>
                  <div>
                    <span className="text-muted d-block" style={{ fontSize: '0.85rem' }}>Date Placed</span>
                    <span className="text-light fw-medium" style={{ fontSize: '0.95rem' }}>
                      {new Date(order.orderDate).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted d-block" style={{ fontSize: '0.85rem' }}>Total Billing</span>
                    <span className="fw-bold text-light" style={{ fontSize: '0.95rem' }}>₹{order.totalAmount.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <div className="mt-2 mt-md-0">
                  <span className={`badge ${getStatusBadgeClass(order.status)} px-3 py-2 fs-6`}>
                    {order.status}
                  </span>
                </div>
              </div>

              {/* Order Body Items */}
              <div className="row g-4">
                <div className="col-12 col-md-8">
                  <h6 className="fw-bold text-light mb-3">Purchased Items</h6>
                  <div className="d-flex flex-column gap-3">
                    {order.products.map((item) => (
                      <div key={item._id} className="d-flex align-items-center gap-3">
                        <div className="bg-dark rounded overflow-hidden" style={{ height: '50px', width: '50px', flexShrink: 0 }}>
                          <img
                            src={item.productId?.image}
                            alt={item.productId?.name}
                            className="w-100 h-100 object-fit-cover"
                            onError={(e) => {
                              e.currentTarget.src = 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=600&auto=format&fit=crop&q=60';
                            }}
                          />
                        </div>
                        <div className="text-truncate flex-grow-1">
                          {item.productId ? (
                            <Link to={`/product/${item.productId._id}`} className="text-decoration-none text-light fw-medium d-block text-truncate">
                              {item.productId.name}
                            </Link>
                          ) : (
                            <span className="text-muted d-block">Deleted Product</span>
                          )}
                          <small className="text-muted">Quantity: {item.quantity} @ ₹{item.price.toLocaleString('en-IN')} each</small>
                        </div>
                        <span className="fw-bold text-light text-end" style={{ width: '100px' }}>
                          ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Delivery details summary */}
                <div className="col-12 col-md-4">
                  <div className="p-3 rounded h-100" style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--glass-border)' }}>
                    <h6 className="fw-bold text-light mb-2"><i className="bi bi-geo-alt me-1 text-primary"></i>Delivery Destination</h6>
                    <small className="text-light d-block">{order.shippingAddress.address}</small>
                    <small className="text-light d-block">{order.shippingAddress.city} - {order.shippingAddress.postalCode}</small>
                    <small className="text-muted d-block mt-2">Contact Phone: {order.shippingAddress.phone}</small>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderHistory;
