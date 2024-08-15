import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../utils/axiosInstance';

// Define the structure of a single subscription channel
interface SubscriptionChannel {
  channelId: string;
  username: string;
  avatar: string;
}

// Define the structure of the API response
interface SubscriptionResponse {
  statuscode: number;
  data: SubscriptionChannel[] ;
  message: string;
  success: boolean;
}

// Function to fetch subscription data
const fetchSubscriptions = async (): Promise<SubscriptionChannel[]> => {
  try {
    const response = await axiosInstance.get<SubscriptionResponse>('/subscriptions/videos/getsubscribedchannels');
    return response.data.data; // Access the correct nested data
  } catch (error:any) {
    console.error('Error fetching subscriptions:', error?.response?.data?.message);
    throw error; // Rethrow to ensure `react-query` handles it
  }
};

// Custom hook for fetching subscriptions
const useGetSubscription = () => {
  return useQuery<SubscriptionChannel[]>({
    queryKey: ['subscriptions'],
    queryFn: fetchSubscriptions,
    staleTime: 60000, // Data is fresh for 1 minute
    refetchInterval: 30000, // Refetch every 30 seconds
    retry: 3, // Retry 3 times on failure
  });
};

export default useGetSubscription;
