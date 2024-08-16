import axiosInstance from '../utils/axiosInstance';

const addToWatchHistory = async ({ videoId, userId }: { videoId: string, userId: string }) => {
  try {
    await axiosInstance.post('/users/history/addhistory', { videoId, userId });
    // The operation is silent, no need to return anything
  } catch (error: any) {
    // Handle the error, log it if necessary
    console.error('Error adding to watch history:', error.response?.data?.message || error.message);
  }
};

export default addToWatchHistory;
