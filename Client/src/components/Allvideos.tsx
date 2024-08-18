import { IVideo } from '../interfaces/Video'
import Sidebar from './Sidebar'
import Loader from './Loader'
import usegetallVideos from '../hooks/useGetallvideos'
import VideoCard from './Videocard'
import { useNavigate } from 'react-router-dom'

function Allvideos() {

    const {isLoading, isError, error, data} = usegetallVideos();
    const navigate = useNavigate();
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
            <p>Error loading <a href=""></a>: {error?.message || 'Something went wrong'}</p>
          </div>
        )
    }

    if (data && data.length === 0) {
        return (
        <div className='flex'>
            <Sidebar/>
          <div className="p-4 flex items-center justify-center h-full text-gray-500">
            <p>NO VIDEOS</p>
          </div>
        </div>
        )
    }

    function onPlay(videoId: string) {
        navigate(`/videos/${videoId}`);
    }
  return (
    <>
    <div className='flex'>
    <Sidebar/>
    <div className="grid grid-cols-1 w-full sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4 dark:bg-gray-950">
        {data?.map((video: IVideo) => (
        <VideoCard key={video._id} video={video} onPlay={() => onPlay(video._id)} />
        ))}
    </div>
    </div>
    </>
  )
}

export default Allvideos