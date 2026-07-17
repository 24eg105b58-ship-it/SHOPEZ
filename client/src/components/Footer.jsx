import React from 'react';

const Footer = () => {
  return (
    <footer className="py-4 mt-auto border-top" style={{ backgroundColor: 'rgba(9, 13, 22, 0.95)', borderColor: 'var(--border-color)' }}>
      <div className="container text-center">
        <p className="mb-1 text-light">&copy; {new Date().getFullYear()} <span className="gradient-text fw-bold">SHOPEZ</span>. All rights reserved.</p>
        <small className="text-muted">Designed with premium aesthetics and built on the MERN stack.</small>
      </div>
    </footer>
  );
};

export default Footer;
