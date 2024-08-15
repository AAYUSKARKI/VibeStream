import { IVideo } from '../interfaces/Video'
import Sidebar from './Sidebar'
import Loader from './Loader'
import useGetHistory from '../hooks/useGethistory'
import VideoCard from './Videocard'

function Watchhistory() {

    const {isLoading, isError, error, data} = useGetHistory()

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
            <p>Error loading history: {error?.message || 'Something went wrong'}</p>
          </div>
        )
    }

    if (data && data.length === 0) {
        return (
        <div className='flex'>
            <Sidebar/>
          <div className="p-4 flex items-center justify-center h-full text-gray-500">
            <p>You have no videos watched yet. Start exploring and watch some videos!</p>
          </div>
        </div>
        )
    }
  return (
    <>
    <div className='flex'>
    <Sidebar/>
    <div className="grid grid-cols-1 w-full sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4 dark:bg-gray-950">
        {data?.map((video: IVideo) => (
        <VideoCard key={video._id} video={video} />
        ))}
    </div>
    </div>
    </>
  )
}

export default Watchhistory