import axios from 'axios';

// Production'da VITE_API_URL env var'ı kullan, local'de proxy çalışır
const BASE_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api';

const api = axios.create({ baseURL: BASE_URL });

// Categories
export const getCategories = () => api.get('/categories').then(r => r.data);
export const createCategory = (data) => api.post('/categories', data).then(r => r.data);
export const updateCategory = (id, data) => api.put(`/categories/${id}`, data).then(r => r.data);
export const deleteCategory = (id) => api.delete(`/categories/${id}`);

// Menu Items
export const getMenuItems = (categoryId) =>
  api.get('/menuitems', { params: categoryId ? { categoryId } : {} }).then(r => r.data);

export const createMenuItem = (formData) =>
  api.post('/menuitems', formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then(r => r.data);

export const updateMenuItem = (id, formData) =>
  api.put(`/menuitems/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then(r => r.data);

export const deleteMenuItem = (id) => api.delete(`/menuitems/${id}`);

// Tables
export const getTables = () => api.get('/tables').then(r => r.data);
export const createTable = (data) => api.post('/tables', data).then(r => r.data);
export const updateTable = (id, data) => api.put(`/tables/${id}`, data).then(r => r.data);
export const deleteTable = (id) => api.delete(`/tables/${id}`);
export const regenerateQR = (id) => api.post(`/tables/${id}/regenerate-qr`).then(r => r.data);

// Orders
export const getOrders = (params) => api.get('/orders', { params }).then(r => r.data);
export const updateOrderStatus = (id, status) => api.put(`/orders/${id}/status`, { status }).then(r => r.data);
export const deleteOrder = (id) => api.delete(`/orders/${id}`);

// Customer Menu
export const getMenu = (tableId) => api.get(`/menu/${tableId}`).then(r => r.data);
export const createOrder = (data) => api.post('/orders', data).then(r => r.data);
