import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../utils/axiosInstance';

// Function to fetch subscription data
const fetchvideobyId = async (id: string) => {
  try {
    const response = await axiosInstance.get(`/videos/${id}`);
    return response.data.data; // Access the correct nested data
  } catch (error: any) {
    console.error('Error fetching Watch history:', error?.response?.data?.message);
    throw error; // Rethrow to ensure `react-query` handles it
  }
};

// Custom hook for fetching subscriptions
const useGetvideobyId = (id: string) => {
    return useQuery({
      queryKey: [`video-${id}`], // Use the video ID in the query key
      queryFn: () => fetchvideobyId(id), // Pass the ID to the fetch function
      staleTime: 60000, // Data is fresh for 1 minute
      refetchInterval: 30000, // Refetch every 30 seconds
      retry: 3, // Retry 3 times on failure
    });
  };

export default useGetvideobyId;
