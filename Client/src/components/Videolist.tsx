import React, { useEffect, useState } from 'react';
import axios from 'axios';
import VideoCard from './Videocard';
import { IVideo } from '../interfaces/Video';
import { Dialog, DialogContent, IconButton, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ReactPlayer from 'react-player';
import Sidebar from './Sidebar';
import {useNavigate} from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';
const VideoList: React.FC = () => {
    const [videos, setVideos] = useState<IVideo[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [selectedVideo, setSelectedVideo] = useState<IVideo | null>(null);
    const navigate = useNavigate();
    useEffect(() => {
        const fetchVideos = async () => {
            try {
                axios.defaults.withCredentials = true;
                const response = await axiosInstance.get('/videos/myvideos');
                setVideos(response.data.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching videos:', error);
                setLoading(false);
            }
        };

        fetchVideos();
    }, []);

    const handlePlay = (videoId: string) => {
        navigate(`/videos/${videoId}`);
        // const video = videos.find((v) => v._id === videoId);
        // if (video) {
        //     setSelectedVideo(video);
        // }
    };

    const handleClose = () => {
        setSelectedVideo(null);
    };

    return (
        <>
        <div className="flex">
        <Sidebar/>
        <div className="grid grid-cols-1 w-full sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4 dark:bg-gray-950">
            {loading ? (
                <Typography variant="h6" color="textSecondary" className="text-center">
                    Loading videos...
                </Typography>
            ) : (
                videos.map((video) => (
                    <VideoCard key={video._id} video={video} onPlay={() => handlePlay(video._id)} />
                ))
            )}

            <Dialog open={Boolean(selectedVideo)} onClose={handleClose} maxWidth="md" fullWidth>
                <IconButton
                    aria-label="close"
                    onClick={handleClose}
                    sx={{
                        position: 'absolute',
                        right: 8,
                        top: 8,
                        color: (theme) => theme.palette.grey[500],
                    }}
                >
                    <CloseIcon />
                </IconButton>
                <DialogContent className="bg-gray-900">
                    {selectedVideo && (
                        <div className="flex flex-col items-center">
                            <Typography variant="h6" color="textPrimary" className="text-center text-white">
                                {selectedVideo.title}
                            </Typography>
                            <ReactPlayer
                                url={selectedVideo.videofile}
                                controls
                                playing
                                width="100%"
                                height="auto"
                                className="mt-4"
                            />
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
        </div>
        </>
    );
};

export default VideoList;
