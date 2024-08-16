import VideoCard from "./Videocard"
import useGetsearchvideos from "../hooks/useGetsearchvideos"
import { useSearchParams } from "react-router-dom"
import Loader from "./Loader";
import Sidebar from "./Sidebar";
import { IVideo } from "../interfaces/Video";
function Searchresults() {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('query')
    if(!query) return <h1>Query is missing</h1>
    const { isLoading,isError, error, data:Searchvideos } = useGetsearchvideos(decodeURIComponent(query));


    if (isLoading) {
        return (
                <Loader />
        )
    }

    if(isError){
        return (
            <div className="flex items-center justify-center h-full text-red-500">
                <p>Error loading search results: {error?.message || 'Something went wrong'}</p>
            </div>
        )
    }

    if(Searchvideos && Searchvideos.length === 0){
        return (
            <div className="p-4 flex items-center justify-center h-full text-gray-500">
                <p>No search results found for "{query}"</p>
            </div>
        )
    }
    
  return (
    <>
    <div className="flex">
        <Sidebar/>
        <div className="grid grid-cols-1 w-full sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4 dark:bg-gray-950">
        {Searchvideos?.map((video: IVideo) => (
        <VideoCard key={video._id} video={video} />
        ))}
    </div>
    </div>
    </>
  )
}

export default Searchresults