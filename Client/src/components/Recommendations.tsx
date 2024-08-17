import useGetRecommendedations from '../hooks/useGetrecommendedvideos';
import { IVideo } from '../interfaces/Video';
import Loader from './Loader';
import VideoCard from './Videocard';
import { useNavigate } from 'react-router-dom';
function Recommendations() {

    const navigate = useNavigate();
    const { data, isLoading, isError } = useGetRecommendedations();

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader />
            </div>
        )
    }

    if (isError) {
        return (
            <div className="flex items-center justify-center h-full text-red-500">
                <p>Error loading recommendations: Something went wrong</p>
            </div>
        )
    }

    if(!data) return null
    
    const onPlay = (videoId: string) => {
        navigate(`/videos/${videoId}`);
    };

  return (
    <div className="grid grid-cols-1 w-full sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4 dark:bg-gray-950">
        {data?.map((video: IVideo) => (
        <VideoCard key={video._id} video={video} onPlay={() => onPlay(video._id)} />
        ))}
    </div>
  )
}

export default Recommendations