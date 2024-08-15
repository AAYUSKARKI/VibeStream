import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';

interface IVideo {
    _id: string;
    videofile: string;
    description: string;
    duration: number;
    thumbnail: string;
    title: string;
    views: number;
    ispublished: boolean;
    owner: {
        _id: string;
        username: string;
        avatar: string;
    };
    createdAt: string;
    updatedAt: string;
}

interface VideoCardProps {
    video: IVideo;
    onPlay?: () => void;
}

const VideoCard: React.FC<VideoCardProps> = ({ video, onPlay }) => {
    const [isHovered, setIsHovered] = useState(false);

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60); // Ensuring seconds are integers
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };
    

    const timeAgo = formatDistanceToNow(new Date(video.createdAt), { addSuffix: true });

    return (
        <div
            className="max-w-md h-[300px] p-2 bg-white dark:bg-gray-900 shadow-lg rounded-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={onPlay}
        >
            {/* Thumbnail with video preview on hover */}
            <div className="relative">
                {isHovered ? (
                    <video
                        src={video.videofile}
                        autoPlay
                        muted
                        loop
                        className="w-full h-48 object-cover"
                    />
                ) : (
                    <img src={video.thumbnail} alt={video.title} className="w-full h-48 object-cover" />
                )}
                {isHovered && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                        <svg
                            className="w-12 h-12 text-white"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-6.704-3.725A1 1 0 007 8.195v7.61a1 1 0 001.048.952h.043c.307 0 .603-.147.777-.39l6.704-3.725a1 1 0 000-1.664z"></path>
                        </svg>
                    </div>
                )}
                <span className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-1.5 py-0.5 rounded">
                    {formatDuration(video.duration)}
                </span>
            </div>

            {/* Content */}
            <div className="flex items-center p-4">
            <img
                src={video.owner.avatar}
                alt={video.owner.username}
                className="w-12 h-12 rounded-full object-cover"
                    /> 
                <div className="flex flex-col p-2">
                <p className="text-gray-900 text-lg dark:text-gray-100 font-semibold truncate">
                    {video.title}
                </p>
                <div className="flex justify-between space-x-2 items-center text-sm text-gray-600 dark:text-gray-400">
                <p className="text-md text-black dark:text-gray-400 truncate">
                        {video.owner.username} .
                    </p>
                    <p>{video.views.toLocaleString()} views .</p>
                    <p>{timeAgo}</p>
                </div>
                </div>            
            </div>
        </div>
    );
};

export default VideoCard;
