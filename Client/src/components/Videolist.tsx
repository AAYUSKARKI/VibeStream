import React from 'react';
import Sidebar from './Sidebar';
import Allvideos from './Allvideos';
const VideoList: React.FC = () => {
    return (
        <>
        <div className="flex">
        <Sidebar/>
        <Allvideos/>
        </div>
        </>
    );
};

export default VideoList;
