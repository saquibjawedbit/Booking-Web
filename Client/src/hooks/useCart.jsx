import { useState, useEffect, useCallback } from 'react';
import {
  getCartItems,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} from '../Api/cart.api';

export const useCart = () => {
  const [cart, setCart] = useState({ items: [] });
  const [totalPrice, setTotalPrice] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch cart items from API
  const fetchCart = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getCartItems();
      const responseData = res.data.data;
      setCart(responseData.cart || { items: [] });
      setTotalPrice(responseData.totalPrice || 0);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // Add item to cart
  const handleAddToCart = async (item) => {
    setLoading(true);
    setError(null);
    try {
      const res = await addToCart(item);
      const responseData = res.data.data;
      setCart(responseData.cart || { items: [] });
      setTotalPrice(responseData.totalPrice || 0);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  // Update cart item quantity
  const handleUpdateCartItem = async (item) => {
    setLoading(true);
    setError(null);
    try {
      const res = await updateCartItem(item);
      const responseData = res.data.data;
      setCart(responseData.cart || { items: [] });
      setTotalPrice(responseData.totalPrice || 0);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  // Remove cart item
  const handleRemoveCartItem = async (itemId) => {
    setLoading(true);
    setError(null);
    try {
      const res = await removeCartItem(itemId);
      const responseData = res.data.data;
      setCart(responseData.cart || { items: [] });
      setTotalPrice(responseData.totalPrice || 0);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  // Clear all items
  const handleClearCart = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await clearCart();
      const responseData = res.data.data;
      setCart(responseData.cart || { items: [] });
      setTotalPrice(responseData.totalPrice || 0);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return {
    cart,                 
    totalPrice,            
    loading,
    error,
    fetchCart,
    addToCart: handleAddToCart,
    updateCartItem: handleUpdateCartItem,
    removeCartItem: handleRemoveCartItem,
    clearCart: handleClearCart,
  };
};

export default useCart;
