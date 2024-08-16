import React, { useEffect, useState } from 'react';
import axiosInstance from '../utils/axiosInstance';
import { useParams } from 'react-router-dom';
import Sidebar from './Sidebar';
import Loader from './Loader';
import VideoCard from './Videocard';
import { IVideo } from '../interfaces/Video';
import ReactPlayer from 'react-player';
import { Typography, Avatar, Button } from '@mui/material';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import CommentIcon from '@mui/icons-material/Comment';
import NotificationsIcon from '@mui/icons-material/Notifications';
import useGetRecommendedations from '../hooks/useGetrecommendedvideos';
import useGetVideoById from '../hooks/useGetvideobyId';
import { useSelector } from 'react-redux';
import {useNavigate} from 'react-router-dom';
import addToWatchHistory from '../hooks/useAddtowatchhistory';
const VideoPlayer: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const { data: video, isLoading, isError, error } = useGetVideoById(id || '');
    const { data: recommendedVideos, isLoading: recommendedVideosLoading, isError: recommendedVideosError } = useGetRecommendedations();
    const { user } = useSelector((state: any) => state.user.user);
    const [liked, setLiked] = useState(false);
    const [likesCount, setLikesCount] = useState(video?.likesCount || 0);
    const [subscribed, setSubscribed] = useState(false);
    const [owner, setOwner] = useState(false);
    const [subscriptionCount, setSubscriptionCount] = useState(0);

    useEffect(() => {
        if (video && Array.isArray(video.likes)) {
            setLiked(video.likes.some((like: any) => like.likedBy === user?._id));
        }
        if(video){
        addToWatchHistory({ videoId: video._id, userId: user?._id });
        }
    }, [video, user]);

    useEffect(() => {
        if(video && Array.isArray(video.subscriberDetails)) {
            setSubscribed(video.subscriberDetails.some((sub: any) => sub._id === user?._id));
        }
    }, [video, user]);

    useEffect(() => {
        setOwner(video?.owner?._id === user?._id);
        setLikesCount(video?.likesCount || 0);
        setSubscriptionCount(video?.subscribersCount || 0);
    }, [video?.likesCount]);

    if (isLoading || recommendedVideosLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader />
            </div>
        );
    }

    if (isError || recommendedVideosError) {
        return (
            <div className="flex items-center justify-center h-full text-red-500">
                <p>Error loading video: {error?.message || 'Something went wrong'}</p>
            </div>
        );
    }

    if (!video) {
        return (
            <div className="flex items-center justify-center h-full text-gray-500">
                <p>Video not found</p>
            </div>
        );
    }

    const handleLike = async () => {
        try {
            setLiked(!liked);
            setLikesCount((prevCount: number) => liked ? prevCount - 1 : prevCount + 1); // Update likes count based on the new like status
            await axiosInstance.post('/likes/like', { videoid: video._id });
        } catch (error) {
            console.error('Error liking video:', error);
        }
    };

    const handleSubscribe = async () => {
        try {
            setSubscribed(!subscribed);
            setSubscriptionCount((prevCount: number) => subscribed ? prevCount - 1 : prevCount + 1); // Update subscription count based on the new subscription status
            await axiosInstance.post('/subscriptions/subscription', { channelid: video.owner._id });
        } catch (error) {
            console.error('Error subscribing to channel:', error);
        }
    };

    function onPlay(videoId: string) {
        navigate(`/videos/${videoId}`);
    }

    return (
        <div className="flex dark:bg-gray-950">
            <Sidebar />
            <div className="flex-1 p-4">
                <div className="flex flex-col lg:flex-row gap-4">
                    {/* Video and Details Section */}
                    <div className="flex-1">
                        <ReactPlayer
                            url={video.videofile}
                            controls
                            playing
                            width="100%"
                            height="auto"
                            className="rounded-lg"
                        />
                        <Typography variant="h6" color="textPrimary" className="mt-4 text-white">
                            {video.title}
                        </Typography>
                        <div className="flex items-center mt-2">
                            <Avatar alt={video.owner.username} src={video.owner.avatar} />
                            <Typography variant="body1" className="ml-2 text-white">
                                {video.owner.username}
                            </Typography>
                        </div>
                        
                        {/* Action Buttons Section */}
                        <div className="flex items-center gap-4 mt-4">
                            <Button
                                variant="contained"
                                color={liked ? 'secondary' : 'primary'}
                                startIcon={<ThumbUpIcon />}
                                onClick={handleLike}
                                className={`bg-${liked ? 'blue-700' : 'gray-500'} text-white hover:bg-${liked ? 'blue-800' : 'gray-600'} dark:bg-${liked ? 'blue-800' : 'gray-700'} dark:hover:bg-${liked ? 'blue-900' : 'gray-700'}`}
                            >
                                {likesCount}
                            </Button>
                            <Button
                                variant="contained"
                                color="secondary"
                                startIcon={<CommentIcon />}
                                className="bg-gray-500 text-white hover:bg-gray-600 dark:bg-gray-700 dark:hover:bg-gray-800"
                            >
                                Comment
                            </Button>
                            <Button
                                variant="contained"
                                color={subscribed ? 'secondary' : 'primary'}
                                startIcon={<NotificationsIcon />}
                                disabled={owner}
                                onClick={handleSubscribe}
                                className={`bg-${subscribed ? 'gray-700' : 'red-500'} dark:text-white  text-black hover:bg-${subscribed ? 'gray-800' : 'red-600'} dark:bg-${subscribed ? 'gray-400' : 'red-500'} dark:hover:bg-${subscribed ? 'blue-900' : 'gray-700'}`}
                            >
                                {subscriptionCount}
                            </Button>
                        </div>
                    </div>

                    {/* Recommended Videos Section */}
                    <div className="w-full lg:w-1/4">
                        <Typography variant="h6" color="textPrimary" className="mb-4 text-white">
                            Recommended Videos
                        </Typography>
                        <div className="space-y-4">
                            {recommendedVideos.map((recVideo: IVideo) => (
                                <VideoCard key={recVideo._id} video={recVideo} onPlay={()=>onPlay(recVideo._id)} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VideoPlayer;
