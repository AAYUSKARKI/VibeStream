import React, { useEffect, useState } from 'react';
import axiosInstance from '../utils/axiosInstance';
import { useParams } from 'react-router-dom';
import Sidebar from './Sidebar';
import Loader from './Loader';
import ReactPlayer from 'react-player';
import { Typography, Avatar, Button } from '@mui/material';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import CommentIcon from '@mui/icons-material/Comment';
import NotificationsIcon from '@mui/icons-material/Notifications';
import useGetvideobyId from '../hooks/useGetvideobyId';
import { useSelector } from 'react-redux';
import Recommendations from './Recommendations';

const VideoPlayer: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { data: video, isLoading, isError, error } = useGetvideobyId(id || '');
    const { user } = useSelector((state: any) => state.user.user);
    const [liked, setLiked] = useState(false);
    const [likesCount, setLikesCount] = useState(video?.likesCount || 0);
    const [subscribed, setSubscribed] = useState(false);
    const [owner, setOwner] = useState(false);
    const [subscriptionCount, setSubscriptionCount] = useState(0);

    useEffect(() => {
        if (video) {
            setLiked(video.isLiked);
            setSubscribed(video.owner.isSubscribed);
            setOwner(video.owner._id === user?._id);
            setLikesCount(video.likesCount);
            setSubscriptionCount(video.owner.subscribersCount);
        }
    }, [video, user]);

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
            setLikesCount((prevCount: number) => liked ? prevCount - 1 : prevCount + 1);
            await axiosInstance.post('/likes/like', { videoid: video._id });
        } catch (error) {
            console.error('Error liking video:', error);
        }
    };

    const handleSubscribe = async () => {
        try {
            setSubscribed(!subscribed);
            setSubscriptionCount((prevCount: number) => subscribed ? prevCount - 1 : prevCount + 1);
            await axiosInstance.post('/subscriptions/subscription', { channelid: video.owner._id });
        } catch (error) {
            console.error('Error subscribing to channel:', error);
        }
    };

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
                        <Typography variant="h6" color="textPrimary" className="mb-4 text-white">
                            Recommended Videos
                        </Typography>
                        <Recommendations />
                </div>
            </div>
        </div>
    );
};

export default VideoPlayer;
