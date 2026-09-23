import axiosInstance from "./axiosInstance";

export const getProductsByCategory = async (category) => {
  const res = await axiosInstance.get(`/products/category/${category}`);
  return res.data;
};
export const fetchProductsByCategory = async (category, search = "") => {
  try {
    const response = await axiosInstance.get(`/products/category/${category}`, {
      params: { search },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
};
export const getProductById = async (id) => {
  try {
    const response = await axiosInstance.get(`/products/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching product by ID:", error);
    throw error;
  }
};
export const fetchProductsBySearch = async (searchTerm) => {
  try {
      console.log("Searching for:", searchTerm); // Debug
    const response = await axiosInstance.get("/products/search", {
      params: { q: searchTerm },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching products by search:", error);
    return [];
  }
};

// Category APIs
export const getAllCategories = async () => {
  const response = await axiosInstance.get("/products/categories");
  return response.data;
};

export const createCategory = async (name, description = "") => {
  const response = await axiosInstance.post("/products/categories", { name, description });
  return response.data;
};

export const deleteCategory = async (name, targetCategory = "General") => {
  const response = await axiosInstance.post("/products/categories/delete", {
    name,
    targetCategory,
  });
  return response.data;
};

// Admin Product APIs
export const getAllProducts = async () => {
  const response = await axiosInstance.get("/products");
  return response.data;
};

export const createProduct = async (productData) => {
  const response = await axiosInstance.post("/products", productData);
  return response.data;
};

export const updateProduct = async (id, productData) => {
  const response = await axiosInstance.put(`/products/${id}`, productData);
  return response.data;
};

export const deleteProduct = async (id) => {
  const response = await axiosInstance.delete(`/products/${id}`);

  return response.data;
};

export const toggleProductStock = async (id, inStock, token) => {
  try {
    const response = await axiosInstance.patch(`/products/${id}/stock`, 
      { inStock },
      token ? { headers: { Authorization: `Bearer ${token}` } } : undefined
    );
    return response.data;
  } catch (error) {
    console.error("Error toggling product stock:", error);
    throw error;
  }
};

export const updateProductStock = async (id, data) => {
  const response = await axiosInstance.patch(`/products/${id}/stock`, data);
  return response.data;
};

export const getLowStockAlerts = async () => {
  const response = await axiosInstance.get("/products/inventory/low-stock");
  return response.data;
};

export const requestProductNotification = async (productId, customerData) => {
  const response = await axiosInstance.post(`/products/${productId}/notify-me`, customerData);
  return response.data;
};

export const dismissCustomerNotification = async (notificationId) => {
  const response = await axiosInstance.patch(`/products/inventory/customer-alerts/${notificationId}/dismiss`);
  return response.data;
};

// Customer Product Reviews APIs
export const getProductReviews = async (productId) => {
  const response = await axiosInstance.get(`/products/${productId}/reviews`);
  return response.data;
};

export const addProductReview = async (productId, reviewData) => {
  const response = await axiosInstance.post(`/products/${productId}/reviews`, reviewData);
  return response.data;
};

export const dismissReviewAlert = async (reviewId) => {
  const response = await axiosInstance.patch(`/products/reviews/${reviewId}/dismiss`);
  return response.data;
};

export const deleteProductReview = async (reviewId) => {
  const response = await axiosInstance.delete(`/products/reviews/${reviewId}`);
  return response.data;
};

export const bulkImportProducts = async (products) => {
  const response = await axiosInstance.post("/products/bulk-import", { products });
  return response.data;
};

