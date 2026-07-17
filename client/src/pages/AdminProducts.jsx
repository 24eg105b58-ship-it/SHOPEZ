import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form states
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState('');

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [stock, setStock] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imageUrl, setImageUrl] = useState(''); // Text fallback
  const [submitting, setSubmitting] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data } = await API.get('/products');
      if (data.success) {
        setProducts(data.products);
      }
    } catch (err) {
      setError('Failed to load products list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleOpenAddForm = () => {
    setIsEditing(false);
    setEditId('');
    setName('');
    setDescription('');
    setPrice('');
    setCategory('');
    setStock('');
    setImageFile(null);
    setImageUrl('');
    setShowForm(true);
  };

  const handleOpenEditForm = (prod) => {
    setIsEditing(true);
    setEditId(prod._id);
    setName(prod.name);
    setDescription(prod.description);
    setPrice(prod.price);
    setCategory(prod.category);
    setStock(prod.stock);
    setImageFile(null);
    setImageUrl(prod.image);
    setShowForm(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!name || !description || !price || !category || !stock) {
      alert('Please fill in all required fields.');
      return;
    }

    setSubmitting(true);
    setError('');

    // Prepare Multipart form-data
    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    formData.append('price', price);
    formData.append('category', category);
    formData.append('stock', stock);
    if (imageFile) {
      formData.append('image', imageFile);
    } else if (imageUrl) {
      formData.append('image', imageUrl);
    }

    try {
      let res;
      if (isEditing) {
        res = await API.put(`/products/${editId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        res = await API.post('/products', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      if (res.data.success) {
        setShowForm(false);
        fetchProducts();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error occurred while saving product details.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        const { data } = await API.delete(`/products/${id}`);
        if (data.success) {
          fetchProducts();
        }
      } catch (err) {
        alert('Failed to delete product.');
      }
    }
  };

  return (
    <div className="container py-5 animate-fade-in">
      {/* Header Tabs */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-5 gap-3">
        <h1 className="fw-bold mb-0">Product Catalog Manager</h1>
        <div className="d-flex gap-2">
          <Link to="/admin" className="btn btn-outline-glow btn-sm">Dashboard</Link>
          <Link to="/admin/products" className="btn btn-glow btn-sm active">Products</Link>
          <Link to="/admin/orders" className="btn btn-outline-glow btn-sm">Orders</Link>
          <Link to="/admin/users" className="btn btn-outline-glow btn-sm">Users</Link>
        </div>
      </div>

      {showForm ? (
        /* Form view */
        <div className="card glass-panel p-4 p-md-5 col-12 col-md-8 mx-auto shadow-lg animate-fade-in">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h3 className="fw-bold mb-0">{isEditing ? 'Edit Product Details' : 'Add New Product'}</h3>
            <button onClick={() => setShowForm(false)} className="btn btn-sm btn-outline-secondary">
              Back to List
            </button>
          </div>

          <form onSubmit={handleFormSubmit}>
            <div className="mb-3">
              <label className="form-label text-light fw-medium">Product Name</label>
              <input
                type="text"
                className="form-control form-glass"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label text-light fw-medium">Description</label>
              <textarea
                className="form-control form-glass"
                rows="4"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              ></textarea>
            </div>

            <div className="row g-3 mb-3">
              <div className="col-6">
                <label className="form-label text-light fw-medium">Price (₹)</label>
                <input
                  type="number"
                  className="form-control form-glass"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                />
              </div>
              <div className="col-6">
                <label className="form-label text-light fw-medium">Stock Level</label>
                <input
                  type="number"
                  className="form-control form-glass"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label text-light fw-medium">Category</label>
              <input
                type="text"
                className="form-control form-glass"
                placeholder="Electronics, Footwear, etc."
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
              />
            </div>

            <div className="mb-4">
              <label className="form-label text-light fw-medium">Product Image File</label>
              <input
                type="file"
                className="form-control form-glass mb-2"
                onChange={(e) => setImageFile(e.target.files[0])}
              />
              <span className="text-muted d-block text-center my-1" style={{ fontSize: '0.85rem' }}>— OR —</span>
              <label className="form-label text-light fw-medium">Image URL Link</label>
              <input
                type="text"
                className="form-control form-glass"
                placeholder="https://example.com/image.jpg"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="btn btn-glow w-100 py-3 d-flex align-items-center justify-content-center gap-2"
              disabled={submitting}
            >
              {submitting && <span className="spinner-border spinner-border-sm" role="status"></span>}
              <i className="bi bi-cloud-arrow-up"></i>
              <span>{submitting ? 'Saving changes...' : 'Save Product Record'}</span>
            </button>
          </form>
        </div>
      ) : (
        /* Products list view */
        <div className="card glass-panel p-4 shadow-lg">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h4 className="fw-bold mb-0">Store Inventory</h4>
            <button onClick={handleOpenAddForm} className="btn btn-glow d-flex align-items-center gap-1">
              <i className="bi bi-plus-circle"></i>
              <span>Add Product</span>
            </button>
          </div>

          {loading ? (
            <div className="d-flex justify-content-center py-5">
              <div className="spinner-border text-primary" role="status"></div>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <span>No products in store database.</span>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-dark table-glass mb-0">
                <thead>
                  <tr>
                    <th>Image</th>
                    <th>Product Name</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((prod) => (
                    <tr key={prod._id}>
                      <td>
                        <img
                          src={prod.image}
                          alt=""
                          style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '6px' }}
                          onError={(e) => {
                            e.currentTarget.src = 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=600&auto=format&fit=crop&q=60';
                          }}
                        />
                      </td>
                      <td className="fw-semibold">{prod.name}</td>
                      <td>{prod.category}</td>
                      <td>₹{prod.price.toLocaleString('en-IN')}</td>
                      <td>
                        {prod.stock <= 5 ? (
                          <span className="text-danger fw-bold">{prod.stock} (Low)</span>
                        ) : (
                          <span>{prod.stock}</span>
                        )}
                      </td>
                      <td className="text-end">
                        <div className="d-flex gap-2 justify-content-end">
                          <button onClick={() => handleOpenEditForm(prod)} className="btn btn-sm btn-outline-glow py-1">
                            <i className="bi bi-pencil"></i>
                          </button>
                          <button onClick={() => handleDeleteProduct(prod._id)} className="btn btn-sm btn-outline-danger py-1">
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
