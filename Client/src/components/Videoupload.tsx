import VideoUpload from './VideoUploadForm'
import Sidebar from './Sidebar'

function Videoupload() {
  return (
    <>
        <div className='flex bg-white dark:bg-gray-950 text-gray-800 dark:text-white'>
            <Sidebar/>
            <VideoUpload/>
        </div>
    </>
  )
}

export default Videoupload