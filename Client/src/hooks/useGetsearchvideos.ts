import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../utils/axiosInstance';

// Function to fetch subscription data
const fetchSearchvideos = async (query: string) => {
  try {
    const response = await axiosInstance.get(`/videos/search/videos/search?query=${query}`);
    return response.data.data; // Access the correct nested data
  } catch (error: any) {
    console.error('Error fetching search videos:', error?.response?.data?.message);
    throw error; // Rethrow to ensure `react-query` handles it
  }
};

// Custom hook for fetching subscriptions
const useGetsearchvideos = (query: string) => {
  return useQuery({
    queryKey: [`Searchvideos-${query}`],
    queryFn: () => fetchSearchvideos(query),
    staleTime: 60000, // Data is fresh for 1 minute
    refetchInterval: 30000, // Refetch every 30 seconds
    retry: 3, // Retry 3 times on failure
  });
};

export default useGetsearchvideos;
