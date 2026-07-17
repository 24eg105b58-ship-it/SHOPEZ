import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import API from '../services/api';
import ProductCard from '../components/ProductCard';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState(['All']);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const searchKeyword = searchParams.get('search') || '';

  // Fetch all products with current filters
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = {};
      if (searchKeyword) params.keyword = searchKeyword;
      if (selectedCategory && selectedCategory !== 'All') params.category = selectedCategory;
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;
      
      // Sort map
      if (sortBy === 'priceAsc') params.sortBy = 'priceAsc';
      if (sortBy === 'priceDesc') params.sortBy = 'priceDesc';

      const { data } = await API.get('/products', { params });
      if (data.success) {
        setProducts(data.products);

        // Extract categories dynamically if not already populated
        if (categories.length === 1) {
          const { data: allData } = await API.get('/products');
          if (allData.success) {
            const uniqueCategories = [
              'All',
              ...new Set(allData.products.map((p) => p.category)),
            ];
            setCategories(uniqueCategories);
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [searchKeyword, selectedCategory, sortBy]);

  const handleApplyPriceFilter = (e) => {
    e.preventDefault();
    fetchProducts();
  };

  const handleClearFilters = () => {
    setSelectedCategory('All');
    setMinPrice('');
    setMaxPrice('');
    setSortBy('newest');
    // Clear URL if search existed by navigating or letting it be
    fetchProducts();
  };

  return (
    <div className="container py-4">
      {/* Hero Banner */}
      {!searchKeyword && (
        <div
          className="p-5 mb-5 rounded-4 position-relative overflow-hidden text-center text-md-start animate-fade-in"
          style={{
            background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.95) 100%)',
            border: '1px solid var(--glass-border)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
          }}
        >
          <div className="position-absolute top-50 start-50 translate-middle w-100 h-100 opacity-25" style={{
            backgroundImage: 'radial-gradient(var(--primary-glow) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
            zIndex: 0
          }}></div>

          <div className="row align-items-center position-relative" style={{ zIndex: 1 }}>
            <div className="col-12 col-md-8">
              <span className="badge badge-glow-primary px-3 py-2 rounded-pill mb-3 text-uppercase fw-bold">
                Summer Sale Live
              </span>
              <h1 className="display-4 fw-extrabold text-light mb-3">
                Elevate Your Shopping <br className="d-none d-lg-inline"/>
                with <span className="gradient-text">SHOPEZ</span>
              </h1>
              <p className="lead text-muted mb-4">
                Discover curated high-end products, lightning-fast mock checkouts, and 
                exclusive seasonal offers. Experience e-commerce reimagined.
              </p>
              <div className="d-flex flex-wrap gap-3">
                <a href="#shop-now" className="btn btn-glow py-3 px-4">
                  Shop Collection
                </a>
                <button onClick={handleClearFilters} className="btn btn-outline-glow py-3 px-4">
                  Reset Filters
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Grid Section */}
      <div className="row g-4" id="shop-now">
        {/* Filters Sidebar */}
        <div className="col-12 col-lg-3">
          <div className="card glass-panel p-4 shadow-sm sticky-top" style={{ top: '90px', zIndex: 1 }}>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h5 className="fw-bold mb-0">Filters</h5>
              <button
                onClick={handleClearFilters}
                className="btn btn-sm btn-link text-decoration-none text-muted p-0"
              >
                Clear All
              </button>
            </div>

            {/* Category Filter */}
            <div className="mb-4">
              <h6 className="text-light fw-semibold mb-3">Categories</h6>
              <div className="d-flex flex-column gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`btn text-start py-2 px-3 rounded-3 border-0 transition-all ${
                      selectedCategory === cat
                        ? 'btn-glow text-white'
                        : 'list-group-item-glass text-muted'
                    }`}
                    style={{ fontSize: '0.9rem' }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Filter */}
            <div className="mb-4">
              <h6 className="text-light fw-semibold mb-3">Price Range (₹)</h6>
              <form onSubmit={handleApplyPriceFilter}>
                <div className="row g-2 mb-3">
                  <div className="col-6">
                    <input
                      type="number"
                      className="form-control form-glass text-center"
                      placeholder="Min"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                    />
                  </div>
                  <div className="col-6">
                    <input
                      type="number"
                      className="form-control form-glass text-center"
                      placeholder="Max"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                    />
                  </div>
                </div>
                <button type="submit" className="btn btn-outline-glow btn-sm w-100 py-2">
                  Apply Price
                </button>
              </form>
            </div>

            {/* Sorting */}
            <div>
              <h6 className="text-light fw-semibold mb-3">Sort By</h6>
              <select
                className="form-select form-glass cursor-pointer"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="newest">Newest Arrivals</option>
                <option value="priceAsc">Price: Low to High</option>
                <option value="priceDesc">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Product Catalog Grid */}
        <div className="col-12 col-lg-9">
          {searchKeyword && (
            <div className="mb-4 animate-fade-in">
              <h4 className="fw-bold">
                Search Results for: <span className="gradient-text">"{searchKeyword}"</span>
              </h4>
              <p className="text-muted">{products.length} products found</p>
            </div>
          )}

          {loading ? (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '40vh' }}>
              <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : products.length === 0 ? (
            <div className="card glass-panel text-center py-5 px-4 animate-fade-in">
              <div className="fs-1 text-muted mb-3">
                <i className="bi bi-box-seam"></i>
              </div>
              <h4 className="fw-bold text-light">No Products Found</h4>
              <p className="text-muted mx-auto" style={{ maxWidth: '450px' }}>
                We couldn't find any products matching your filters. Try clearing some constraints or search query and browse our catalog.
              </p>
              <button onClick={handleClearFilters} className="btn btn-glow mt-2 mx-auto">
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="row row-cols-1 row-cols-md-2 row-cols-xl-3 g-4">
              {products.map((product) => (
                <div className="col animate-fade-in" key={product._id}>
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
