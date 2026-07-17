import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data } = await API.get('/orders/all');
      if (data.success) {
        setOrders(data.orders);
      }
    } catch (err) {
      setError('Failed to fetch store orders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const { data } = await API.put(`/orders/${orderId}/status`, { status: newStatus });
      if (data.success) {
        alert(`Order status updated to: ${newStatus}`);
        fetchOrders(); // Refresh order records
      }
    } catch (err) {
      alert('Failed to update order status.');
    }
  };

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

  return (
    <div className="container py-5 animate-fade-in">
      {/* Header Tabs */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-5 gap-3">
        <h1 className="fw-bold mb-0">Store Orders Manager</h1>
        <div className="d-flex gap-2">
          <Link to="/admin" className="btn btn-outline-glow btn-sm">Dashboard</Link>
          <Link to="/admin/products" className="btn btn-outline-glow btn-sm">Products</Link>
          <Link to="/admin/orders" className="btn btn-glow btn-sm active">Orders</Link>
          <Link to="/admin/users" className="btn btn-outline-glow btn-sm">Users</Link>
        </div>
      </div>

      <div className="card glass-panel p-4 shadow-lg animate-fade-in">
        <h4 className="fw-bold mb-4">Customer Orders</h4>

        {loading ? (
          <div className="d-flex justify-content-center py-5">
            <div className="spinner-border text-primary" role="status"></div>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-5 text-muted">
            <span>No orders recorded in system.</span>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-dark table-glass mb-0">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Total Amount</th>
                  <th>Items Purchased</th>
                  <th>Status</th>
                  <th>Action Update</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((ord) => (
                  <tr key={ord._id}>
                    <td className="fw-bold" style={{ fontSize: '0.85rem' }}>#{ord._id.substring(0, 10)}...</td>
                    <td>
                      <span className="fw-medium text-light d-block">{ord.userId?.name || 'Deleted Account'}</span>
                      <small className="text-muted" style={{ fontSize: '0.8rem' }}>{ord.userId?.email || 'N/A'}</small>
                    </td>
                    <td style={{ fontSize: '0.9rem' }}>
                      {new Date(ord.orderDate).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                    <td className="fw-bold">₹{ord.totalAmount.toLocaleString('en-IN')}</td>
                    <td style={{ fontSize: '0.9rem' }}>
                      <div className="d-flex flex-column gap-1">
                        {ord.products.map((p, idx) => (
                          <span key={idx} className="text-truncate" style={{ maxWidth: '180px' }}>
                            • {p.productId?.name || 'Deleted Product'} <small className="text-muted">x{p.quantity}</small>
                          </span>
                        ))}
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${getStatusBadgeClass(ord.status)} py-2 px-3`}>
                        {ord.status}
                      </span>
                    </td>
                    <td>
                      <select
                        className="form-select form-glass form-select-sm cursor-pointer w-auto"
                        value={ord.status}
                        onChange={(e) => handleStatusChange(ord._id, e.target.value)}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Paid">Paid</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrders;
