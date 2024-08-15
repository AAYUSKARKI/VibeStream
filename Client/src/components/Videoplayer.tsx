import React, { useEffect, useState } from 'react';
import axiosInstance from '../utils/axiosInstance';
import { useParams } from 'react-router-dom';
import Sidebar from './Sidebar';
import VideoCard from './Videocard';
import { IVideo } from '../interfaces/Video';
import ReactPlayer from 'react-player';
import { Typography, Avatar, Button } from '@mui/material';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import CommentIcon from '@mui/icons-material/Comment';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { socket } from '../utils/socket';

const VideoPlayer: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [video, setVideo] = useState<IVideo | null>(null);
    const [recommendedVideos, setRecommendedVideos] = useState<IVideo[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    console.log(video, 'video');

    useEffect(() => {
        const fetchVideoDetails = async () => {
            try {
                const response = await axiosInstance.get(`/videos/${id}`);
                setVideo(response.data.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching video details:', error);
                setLoading(false);
            }
        };

        const fetchRecommendedVideos = async () => {
            try {
                const response = await axiosInstance.get('/videos/recommended/videos/recommended');
                setRecommendedVideos(response.data.data);
            } catch (error) {
                console.error('Error fetching recommended videos:', error);
            }
        };

        fetchVideoDetails();
        fetchRecommendedVideos();
    }, [id]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen dark:bg-gray-950">
                <Typography variant="h6" color="textSecondary">
                    Loading video...
                </Typography>
            </div>
        );
    }

    if (!video) {
        return (
            <div className="flex items-center justify-center min-h-screen dark:bg-gray-950">
                <Typography variant="h6" color="textSecondary">
                    Video not found.
                </Typography>
            </div>
        );
    }

const handleLike = async () => {
    try {
          await axiosInstance.post('/likes/like', { videoid: video._id });
    } catch (error) {
        console.error('Error liking video:', error);
    }
}

useEffect(() => {
    if (video) {
        socket.on('like', (videoid) => {
            if (videoid === video._id) {
                setVideo(prevVideo => prevVideo ? { ...prevVideo, likesCount: prevVideo?.likesCount || 0 + 1 } : null);
            }
        });

        socket.on('unlike', (videoid) => {
            if (videoid === video._id) {
                setVideo(prevVideo => prevVideo ? { ...prevVideo, likesCount: prevVideo?.likesCount || 0 - 1 } : null);
            }
        });
    }

    return () => {
        socket.off('like');
        socket.off('unlike');
    };
}, [video]);

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
                                color="primary"
                                startIcon={<ThumbUpIcon />}
                                onClick={handleLike}
                                className="bg-blue-500 text-white hover:bg-blue-600 dark:bg-blue-700 dark:hover:bg-blue-800"
                            >
                            {video.likesCount}
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
                                color="inherit"
                                startIcon={<NotificationsIcon />}
                                className="bg-red-500 text-white hover:bg-red-600 dark:bg-red-700 dark:hover:bg-red-800"
                            >
                                Subscribe
                            </Button>
                        </div>
                    </div>

                    {/* Recommended Videos Section */}
                    <div className="w-full lg:w-1/4">
                        <Typography variant="h6" color="textPrimary" className="mb-4 text-white">
                            Recommended Videos
                        </Typography>
                        <div className="space-y-4">
                            {recommendedVideos.map((recVideo) => (
                                <VideoCard key={recVideo._id} video={recVideo} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VideoPlayer;
