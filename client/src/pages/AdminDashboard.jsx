import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await API.get('/users/admin/stats');
        if (data.success) {
          setStats(data.stats);
        }
      } catch (err) {
        setError('Failed to load dashboard metrics.');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="container py-5 text-center">
        <div className="alert alert-danger bg-danger text-white border-0 py-4 mb-4">
          <h4>Admin Access Restriction</h4>
          <p className="mb-0">{error || 'Unable to fetch analytics telemetry.'}</p>
        </div>
      </div>
    );
  }

  // Prep SVG Bar Chart dimensions and scales
  const chartHeight = 220;
  const chartWidth = 500;
  const barPadding = 30;
  const maxRevenue = Math.max(...stats.categoryStats.map((c) => c.revenue), 1000);

  return (
    <div className="container py-5 animate-fade-in">
      {/* Header and navigation tabs */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-5 gap-3">
        <h1 className="fw-bold mb-0">Admin Control Center</h1>
        <div className="d-flex gap-2">
          <Link to="/admin" className="btn btn-glow btn-sm active">Dashboard</Link>
          <Link to="/admin/products" className="btn btn-outline-glow btn-sm">Products</Link>
          <Link to="/admin/orders" className="btn btn-outline-glow btn-sm">Orders</Link>
          <Link to="/admin/users" className="btn btn-outline-glow btn-sm">Users</Link>
        </div>
      </div>

      {/* Metrics Cards Grid */}
      <div className="row g-4 mb-5">
        {/* Total Revenue */}
        <div className="col-12 col-sm-6 col-lg-3">
          <div className="stat-card shadow-sm h-100">
            <div className="stat-icon bg-primary bg-opacity-25 text-primary">
              <i className="bi bi-currency-rupee"></i>
            </div>
            <span className="text-muted d-block mb-1" style={{ fontSize: '0.85rem' }}>Total Sales Revenue</span>
            <h3 className="fw-bold text-light mb-0">₹{stats.totalRevenue.toLocaleString('en-IN')}</h3>
          </div>
        </div>

        {/* Total Orders */}
        <div className="col-12 col-sm-6 col-lg-3">
          <div className="stat-card shadow-sm h-100">
            <div className="stat-icon bg-success bg-opacity-25 text-success">
              <i className="bi bi-cart-check"></i>
            </div>
            <span className="text-muted d-block mb-1" style={{ fontSize: '0.85rem' }}>Completed Orders</span>
            <h3 className="fw-bold text-light mb-0">{stats.totalOrders}</h3>
          </div>
        </div>

        {/* Total Users */}
        <div className="col-12 col-sm-6 col-lg-3">
          <div className="stat-card shadow-sm h-100">
            <div className="stat-icon bg-warning bg-opacity-25 text-warning">
              <i className="bi bi-people"></i>
            </div>
            <span className="text-muted d-block mb-1" style={{ fontSize: '0.85rem' }}>Registered Customers</span>
            <h3 className="fw-bold text-light mb-0">{stats.totalUsers}</h3>
          </div>
        </div>

        {/* Total Products */}
        <div className="col-12 col-sm-6 col-lg-3">
          <div className="stat-card shadow-sm h-100">
            <div className="stat-icon bg-danger bg-opacity-25 text-danger">
              <i className="bi bi-box-seam"></i>
            </div>
            <span className="text-muted d-block mb-1" style={{ fontSize: '0.85rem' }}>Active Products</span>
            <h3 className="fw-bold text-light mb-0">{stats.totalProducts}</h3>
          </div>
        </div>
      </div>

      <div className="row g-4 mb-5">
        {/* Sales Chart Section */}
        <div className="col-12 col-lg-6">
          <div className="card glass-panel p-4 h-100">
            <h5 className="fw-bold text-light mb-4"><i className="bi bi-graph-up-arrow me-2 text-primary"></i>Category Sales Report</h5>
            {stats.categoryStats.length === 0 ? (
              <div className="d-flex align-items-center justify-content-center text-muted h-75">
                <span>No category revenue statistics recorded.</span>
              </div>
            ) : (
              <div className="text-center overflow-auto">
                <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} width="100%" height={chartHeight} style={{ minWidth: '350px' }}>
                  <defs>
                    <linearGradient id="barGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#d946ef" />
                      <stop offset="100%" stopColor="#6366f1" />
                    </linearGradient>
                  </defs>
                  
                  {/* Grid Lines */}
                  <line x1="50" y1="20" x2="480" y2="20" stroke="rgba(255,255,255,0.05)" />
                  <line x1="50" y1="90" x2="480" y2="90" stroke="rgba(255,255,255,0.05)" />
                  <line x1="50" y1="160" x2="480" y2="160" stroke="rgba(255,255,255,0.05)" />

                  {/* Draw Bars */}
                  {stats.categoryStats.map((item, idx) => {
                    const barWidth = (chartWidth - 100) / stats.categoryStats.length - barPadding;
                    const x = 60 + idx * (barWidth + barPadding);
                    const barHeight = (item.revenue / maxRevenue) * 140; // max height 140px
                    const y = 160 - barHeight;

                    return (
                      <g key={item.category}>
                        {/* Bar */}
                        <rect
                          x={x}
                          y={y}
                          width={barWidth}
                          height={barHeight}
                          fill="url(#barGrad)"
                          rx="4"
                          style={{ transition: 'all 0.3s' }}
                        />
                        {/* Value Text */}
                        <text
                          x={x + barWidth / 2}
                          y={y - 8}
                          fill="#f3f4f6"
                          fontSize="10"
                          fontWeight="bold"
                          textAnchor="middle"
                        >
                          ₹{item.revenue > 1000 ? `${(item.revenue / 1000).toFixed(1)}k` : item.revenue}
                        </text>
                        {/* Category Label */}
                        <text
                          x={x + barWidth / 2}
                          y="180"
                          fill="#9ca3af"
                          fontSize="10"
                          textAnchor="middle"
                        >
                          {item.category.substring(0, 10)}
                        </text>
                      </g>
                    );
                  })}
                  
                  {/* Base Line */}
                  <line x1="50" y1="160" x2="480" y2="160" stroke="rgba(255,255,255,0.15)" strokeWidth="2" />
                </svg>
              </div>
            )}
          </div>
        </div>

        {/* Recent Orders Section */}
        <div className="col-12 col-lg-6">
          <div className="card glass-panel p-4 h-100">
            <h5 className="fw-bold text-light mb-4"><i className="bi bi-clock-history me-2 text-success"></i>Recent Completed Orders</h5>
            {stats.recentOrders.length === 0 ? (
              <div className="d-flex align-items-center justify-content-center text-muted h-75">
                <span>No paid orders cataloged.</span>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-dark table-glass mb-0">
                  <thead>
                    <tr>
                      <th>Customer</th>
                      <th>Revenue</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentOrders.map((ord) => (
                      <tr key={ord._id}>
                        <td>{ord.userId?.name || 'Guest'}</td>
                        <td>₹{ord.totalAmount.toLocaleString('en-IN')}</td>
                        <td>
                          <span className="badge badge-glow-success px-2 py-1" style={{ fontSize: '0.75rem' }}>
                            {ord.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
