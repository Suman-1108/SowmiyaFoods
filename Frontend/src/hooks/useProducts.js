import { useQuery } from '@tanstack/react-query'
import axiosInstance from '../api/axiosInstance'

const defaultQueryOptions = {
  retry: 1,
  staleTime: 1000 * 60 * 5, // 5 minutes
  refetchOnWindowFocus: false,
};

// Consolidated home page data (latest + trending in one call)
export const useHomeProducts = () => {
  return useQuery({
    queryKey: ['homeProducts'],
    queryFn: async () => {
      const res = await axiosInstance.get('/products/home')
      return res.data // { latestProducts: [...], trendingProducts: [...] }
    },
    ...defaultQueryOptions,
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
    ...defaultQueryOptions,
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
    ...defaultQueryOptions,
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
    ...defaultQueryOptions,
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
    ...defaultQueryOptions,
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
    ...defaultQueryOptions,
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
    ...defaultQueryOptions,
  })
}