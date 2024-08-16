import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../utils/axiosInstance';

// Function to fetch subscription data
const fetchSearchsuggestions = async (query: string) => {
  try {
    if (!query) return [];
    const response = await axiosInstance.get(`/videos/search/suggestions?query=${query}`);
    return response.data.data; // Access the correct nested data
  } catch (error: any) {
    console.error('Error fetching Watch history:', error?.response?.data?.message);
    throw error; // Rethrow to ensure `react-query` handles it
  }
};

// Custom hook for fetching subscriptions
const useGetsuggestions = (query: string) => {
  return useQuery({
    queryKey: [`Searchsuggestions-${query}`],
    queryFn: () => fetchSearchsuggestions(query),
    staleTime: 60000, // Data is fresh for 1 minute
    refetchInterval: 30000, // Refetch every 30 seconds
    retry: 3, // Retry 3 times on failure
  });
};

export default useGetsuggestions;
