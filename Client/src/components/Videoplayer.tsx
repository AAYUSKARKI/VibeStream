import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import Sidebar from './Sidebar';
import { fetchVideoById } from '../redux/videoslice';
import Recommendations from './Recommendations';
import { AppDispatch, RootState } from '../redux/store';
import VideoDetails from './Videodetails';
import Loader from './Loader';
const VideoPlayer: React.FC = () => {
    const dispatch: AppDispatch = useDispatch();
    const { id } = useParams<{ id: string }>();
    const { isLoading,error } = useSelector((state: RootState) => state.videos);
    useEffect(() => {
        if (id) {
            dispatch(fetchVideoById(id));
        }
    }, [id, dispatch]);

    if (isLoading) {
        return <Loader />;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div className="flex min-h-screen dark:bg-gray-950 dark:text-white bg-gray-50 text-gray-800">
            <Sidebar />
            <div className="flex-1 p-2 dark:bg-gray-950 dark:text-white bg-gray-50 text-gray-800">
                <VideoDetails />
                <div className="mt-6 dark:bg-gray-950 dark:text-white bg-gray-50 text-gray-800">
                    <h2 className="md:text-2xl text-lg font-semibold mb-4 dark:bg-gray-950 dark:text-white bg-gray-50 text-gray-800">Recommended Videos</h2>
                    <Recommendations />
                </div>
            </div>
        </div>
    );
};

export default VideoPlayer;
