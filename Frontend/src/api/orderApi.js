import axiosInstance from "./axiosInstance";

// Get all orders (Admin)
export const getAllOrders = async (token) => {
  const { data } = await axiosInstance.get("/orders/admin/all", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

// Update order status & tracking number (Admin)
export const updateOrderStatus = async (id, { status, trackingNumber }, token) => {
  const { data } = await axiosInstance.put(
    `/orders/admin/${id}/status`,
    { status, trackingNumber },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return data;
};

// Get single order by ID (Admin)
export const getOrderById = async (id, token) => {
  const { data } = await axiosInstance.get(`/orders/admin/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

// Get orders by user
export const getOrdersByUser = async (userId) => {
  const { data } = await axiosInstance.get(`/orders/${userId}`);
  return data;
};