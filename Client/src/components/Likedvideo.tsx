import axiosInstance from '../utils/axiosInstance'
import { IVideo } from '../interfaces/Video'
import { useEffect, useState } from 'react'
import Sidebar from './Sidebar'
function Likedvideo() {
    const [likedvideo,setLikedvideos]=useState<IVideo[]>([])

    const getlikedVideos = async()=>{
        const res = await axiosInstance.get('/likes/likedvideos')
        setLikedvideos(res.data.data)
    }

    useEffect(()=>{
        getlikedVideos()
    },[])

    if(!likedvideo){
        return <h1>No liked videos found</h1>
    }

  return (
    <>
    <div className='flex'>
       <Sidebar/>
       <h1>hi</h1>
    </div>
    </>
  )
}

export default Likedvideo