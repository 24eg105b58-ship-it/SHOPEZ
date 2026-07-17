import React, { createContext, useState, useEffect, useContext } from 'react';
import API from '../services/api';
import { AuthContext } from './AuthContext';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // Sync cart from backend when user logs in or out
  useEffect(() => {
    const fetchCart = async () => {
      if (user) {
        setLoading(true);
        try {
          const { data } = await API.get('/cart');
          if (data.success && data.cart) {
            setCartItems(data.cart.products || []);
          }
        } catch (error) {
          console.error('Error fetching cart from server:', error);
        } finally {
          setLoading(false);
        }
      } else {
        setCartItems([]);
      }
    };
    fetchCart();
  }, [user]);

  // Add to cart
  const addToCart = async (productId, quantity = 1) => {
    if (!user) {
      return { success: false, message: 'Please login to add products to your cart.' };
    }
    try {
      const { data } = await API.post('/cart/add', { productId, quantity });
      if (data.success) {
        setCartItems(data.cart.products || []);
        return { success: true };
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to add product to cart.',
      };
    }
  };

  // Update quantity
  const updateQuantity = async (productId, quantity) => {
    if (!user) return;
    try {
      const { data } = await API.put('/cart/update', { productId, quantity });
      if (data.success) {
        setCartItems(data.cart.products || []);
        return { success: true };
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update quantity.',
      };
    }
  };

  // Remove item
  const removeFromCart = async (productId) => {
    if (!user) return;
    try {
      const { data } = await API.delete(`/cart/${productId}`);
      if (data.success) {
        setCartItems(data.cart.products || []);
        return { success: true };
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to remove product from cart.',
      };
    }
  };

  // Clear cart
  const clearCart = async () => {
    if (!user) return;
    try {
      const { data } = await API.delete('/cart');
      if (data.success) {
        setCartItems([]);
        return { success: true };
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to clear cart.',
      };
    }
  };

  // Calculations
  const getCartCount = () => {
    return cartItems.reduce((acc, item) => acc + item.quantity, 0);
  };

  const getCartTotal = () => {
    return cartItems.reduce((acc, item) => {
      const price = item.productId?.price || 0;
      return acc + price * item.quantity;
    }, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        loading,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        getCartCount,
        getCartTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
