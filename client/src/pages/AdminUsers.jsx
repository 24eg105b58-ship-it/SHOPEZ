import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await API.get('/users');
      if (data.success) {
        setUsers(data.users);
      }
    } catch (err) {
      setError('Failed to fetch user accounts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDeleteUser = async (id) => {
    if (window.confirm('Are you sure you want to delete this user account?')) {
      try {
        const { data } = await API.delete(`/users/${id}`);
        if (data.success) {
          alert('User account deleted.');
          fetchUsers();
        }
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete user account.');
      }
    }
  };

  return (
    <div className="container py-5 animate-fade-in">
      {/* Header Tabs */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-5 gap-3">
        <h1 className="fw-bold mb-0">Registered User Accounts</h1>
        <div className="d-flex gap-2">
          <Link to="/admin" className="btn btn-outline-glow btn-sm">Dashboard</Link>
          <Link to="/admin/products" className="btn btn-outline-glow btn-sm">Products</Link>
          <Link to="/admin/orders" className="btn btn-outline-glow btn-sm">Orders</Link>
          <Link to="/admin/users" className="btn btn-glow btn-sm active">Users</Link>
        </div>
      </div>

      <div className="card glass-panel p-4 shadow-lg animate-fade-in">
        <h4 className="fw-bold mb-4">Customer Accounts</h4>

        {loading ? (
          <div className="d-flex justify-content-center py-5">
            <div className="spinner-border text-primary" role="status"></div>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-5 text-muted">
            <span>No user accounts recorded.</span>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-dark table-glass mb-0">
              <thead>
                <tr>
                  <th>User ID</th>
                  <th>Full Name</th>
                  <th>Email Address</th>
                  <th>Account Role</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((usr) => (
                  <tr key={usr._id}>
                    <td className="fw-bold text-muted" style={{ fontSize: '0.85rem' }}>#{usr._id}</td>
                    <td className="fw-semibold text-light">{usr.name}</td>
                    <td>{usr.email}</td>
                    <td>
                      <span className={`badge ${usr.role === 'admin' ? 'badge-glow-warning' : 'badge-glow-primary'} py-1 px-3`}>
                        {usr.role.toUpperCase()}
                      </span>
                    </td>
                    <td className="text-end">
                      <button
                        onClick={() => handleDeleteUser(usr._id)}
                        className="btn btn-sm btn-outline-danger py-1"
                        disabled={usr.role === 'admin'}
                        title={usr.role === 'admin' ? 'Admin accounts cannot be deleted' : 'Delete user'}
                      >
                        <i className="bi bi-trash"></i>
                      </button>
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

export default AdminUsers;
