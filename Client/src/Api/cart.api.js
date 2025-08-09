import { axiosClient } from '../AxiosClient/axios';

// Get current user's cart
export const getCartItems = async () => {
  const res = await axiosClient.get('/api/cart/', {
    withCredentials: true,
  });
  return res;
};

// Add item to cart
export const addToCart = async (data) => {
  const res = await axiosClient.post('/api/cart/add', data, {
    withCredentials: true,
  });
  return res;
};

// Update item in cart (quantity, rentalPeriod, purchase)
export const updateCartItem = async (data) => {
  const res = await axiosClient.put('/api/cart/update', data, {
    withCredentials: true,
  });
  return res;
};

// Remove item from cart
export const removeCartItem = async (data) => {
  const res = await axiosClient.put('/api/cart/remove', data, {
    withCredentials: true,
  });
  return res;
};

// Clear all items from cart
export const clearCart = async () => {
  const res = await axiosClient.delete('/api/cart/clear', {
    withCredentials: true,
  });
  return res;
};