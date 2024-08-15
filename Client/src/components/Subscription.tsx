import React from 'react';
import useGetSubscription from '../hooks/useGetsubscription'; // Ensure the path is correct
import Loader from './Loader'; // Adjust path as necessary

const Subscription: React.FC = () => {
  // Use the custom hook to fetch subscriptions
  const { data, isLoading, isError, error } = useGetSubscription();
console.log(data)
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-full text-red-500">
        <p>Error loading subscriptions: {error?.message || 'Something went wrong'}</p>
      </div>
    );
  }

  if (data && data.length === 0) {
    return (
      <div className="p-4 flex items-center justify-center h-full text-gray-500">
        <p>You have no subscriptions yet. Start exploring and subscribe to your favorite channels!</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Your Subscriptions</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {data && data.map((channel) => (
          <div
            key={channel.channelId}
            className="flex items-center p-4 bg-white shadow-lg rounded-lg"
          >
            <img
              src={channel.avatar}
              alt={channel.username}
              className="w-12 h-12 rounded-full object-cover mr-4"
            />
            <div>
              <h2 className="text-xl font-semibold">{channel.username}</h2>
              <p className="text-gray-600">{channel.channelId}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Subscription;
