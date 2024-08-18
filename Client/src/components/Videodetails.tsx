import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axiosInstance from '../utils/axiosInstance';
import { FaThumbsUp, FaComment} from 'react-icons/fa';
import ReactPlayer from 'react-player';
import { RootState } from '../redux/store';
import { setLikedState, setSubscribedState } from '../redux/videoslice';
import Loader from './Loader';
import { formatDistanceToNow } from 'date-fns';
import { IoMdSend } from 'react-icons/io';
const VideoDetails = () => {
    const dispatch = useDispatch();
    const video = useSelector((state: RootState) => state.videos.video);
    const user = useSelector((state: RootState) => state.user.user.user);
    const liked = useSelector((state: RootState) => state.videos.liked);
    const likesCount = useSelector((state: RootState) => state.videos.likesCount);
    const subscribed = useSelector((state: RootState) => state.videos.subscribed);
    const subscriptionCount = useSelector((state: RootState) => state.videos.subscriptionCount);
    const owner = video?.owner._id === user?._id;
    useEffect(() => {
      if (video) {
        dispatch(setLikedState({ liked: video.isLiked, likesCount: video.likesCount }));
        dispatch(setSubscribedState({ subscribed: video.owner.isSubscribed, subscriptionCount: video.owner.subscribersCount }));
      }
    }, [video,dispatch]);
    const handleLike = async () => {
      if (!video) return;

      try {
        const newLikedState = !liked;
        const newLikesCount = liked ? likesCount - 1 : likesCount + 1;
        await axiosInstance.post('/likes/like', { videoid: video._id });
        dispatch(setLikedState({ liked: newLikedState, likesCount: newLikesCount }));
      } catch (error) {
        console.error('Error liking video:', error);
      }
    };

    const handleSubscribe = async () => {
      if (!video) return;

      try {
        const newSubscribedState = !subscribed;
        const newSubscriptionCount = subscribed ? subscriptionCount - 1 : subscriptionCount + 1;
        await axiosInstance.post('/subscriptions/subscription', { channelid: video.owner._id });
        dispatch(setSubscribedState({ subscribed: newSubscribedState, subscriptionCount: newSubscriptionCount }));
      } catch (error) {
        console.error('Error subscribing to channel:', error);
      }
    };

    if (!video) return <Loader />;
  
  const timeAgo = formatDistanceToNow(new Date(video.createdAt), { addSuffix: true });
    return (
      <div className="flex flex-col dark:bg-gray-950 dark:text-white bg-gray-50 text-gray-800 rounded-lg shadow-lg max-w-screen-lg mx-auto">
        <ReactPlayer
          url={video.videofile}
          playing
          controls
          width="100%"
          height="100%"
          className="rounded-lg shadow-lg"
        />
        <h2 className="mt-4 text:md md:text-xl">{video.title}</h2>
        <div className='flex gap-2'>
        <p className="text-gray-600">{timeAgo}</p>
        <p className='text-gray-600'>{video.views} views</p>
        </div>
        <div className="flex items-center mt-2">
          <img
            alt={video.owner.username}
            src={video.owner.avatar}
            className="md:w-10 md:h-10 h-6 w-6 rounded-full border-2 border-gray-700"
          />
          <span className="md:ml-3 ml-2 text-sm md:text-xl md:font-medium">{video.owner.username}</span>
          <p className="ml-3 text-gray-600">{subscriptionCount}</p><span className='ml-2 hidden md:block'>subscribers</span>
          <div className='rounded-lg flex ml-auto items-center justify-center bg-gray-700 hover:bg-gray-600'>
            <button 
            onClick={handleSubscribe}
            disabled={owner}
            className={`flex items-center px-3 text-sm md:text-xl py-1 rounded-lg text-gray-700 transition duration-300 ease-in-out ${subscribed ? 'bg-gray-600 text-white hover:bg-gray-500' : 'bg-white hover:bg-slate-50'} ${owner ? 'cursor-not-allowed opacity-50' : ''}`}>
              {subscribed ? 'subscribed' : 'subscribe'}
              </button>
          </div>
        </div>
        <div className="flex items-center gap-6 mt-6">
          <button
            onClick={handleLike}
            className="flex items-center px-3 py-1 rounded-lg bg-gray-700 hover:bg-gray-600 text-white transition duration-300 ease-in-out"
          >
            <FaThumbsUp
            color={liked ? 'white' : 'gray'}
            className="mr-2 text-sm md:text-xl" />
            <span className="text-sm md:text-xl">{likesCount}</span>
          </button>
          <button
            className="flex items-center px-3 py-1 rounded-lg bg-gray-700 hover:bg-gray-600 text-white transition duration-300 ease-in-out"
          >
            <FaComment className="md:block hidden mr-2 text-sm md:text-xl" />
            <input
            className='bg-transparent text-sm md:text-lg text-white outline-none w-[10rem] md:w-[860px] placeholder:text-white placeholder:opacity-50 focus:outline-none focus:ring-0 focus:ring-offset-0 focus:border-0' 
            type="text"
            placeholder='write a comment here ...' />
            <IoMdSend className="ml-2 tsxt-sm md:text-xl" />
          </button>
        </div>
      </div>
    );
};

export default VideoDetails;
