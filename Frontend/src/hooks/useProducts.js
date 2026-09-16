import { useQuery } from '@tanstack/react-query'
import axiosInstance from '../api/axiosInstance'

// Consolidated home page data (latest + trending in one call)
export const useHomeProducts = () => {
  return useQuery({
    queryKey: ['homeProducts'],
    queryFn: async () => {
      const res = await axiosInstance.get('/products/home')
      return res.data // { latestProducts: [...], trendingProducts: [...] }
    },
  })
}

// Latest products individually
export const useLatestProducts = () => {
  return useQuery({
    queryKey: ['latestProducts'],
    queryFn: async () => {
      const res = await axiosInstance.get('/products/latest')
      return Array.isArray(res.data) ? res.data : []
    },
  })
}

// Trending products individually
export const useTrendingProducts = () => {
  return useQuery({
    queryKey: ['trendingProducts'],
    queryFn: async () => {
      const res = await axiosInstance.get('/products/trending')
      return Array.isArray(res.data) ? res.data : []
    },
  })
}

// Product by ID
export const useProductById = (id) => {
  return useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const res = await axiosInstance.get(`/products/${id}`)
      return res.data
    },
    enabled: !!id,
  })
}

// Products by category
export const useProductsByCategory = (category, search = '') => {
  return useQuery({
    queryKey: ['productsByCategory', category, search],
    queryFn: async () => {
      const res = await axiosInstance.get(`/products/category/${category}`, {
        params: { search },
      })
      return res.data
    },
    enabled: !!category,
  })
}

// Products by search
export const useProductsBySearch = (searchTerm) => {
  return useQuery({
    queryKey: ['productsBySearch', searchTerm],
    queryFn: async () => {
      const res = await axiosInstance.get('/products/search', {
        params: { q: searchTerm },
      })
      return res.data
    },
    enabled: !!searchTerm,
  })
}

// All products (Admin)
export const useAllProducts = () => {
  return useQuery({
    queryKey: ['allProducts'],
    queryFn: async () => {
      const res = await axiosInstance.get('/products')
      return res.data
    },
  })
}