import { useSelector } from "react-redux"
import { FaEdit } from "react-icons/fa"

function Channelheader() {

    const {user} = useSelector((state:any)=>state?.user?.user)
  return (
    <div className='w-full bg-gray-950  dark:bg-gray-950'>
        <section className="relative">
        <img 
          className="w-full h-[8rem]"
          src={user.coverimage ? user.coverimage : 'https://res.cloudinary.com/dgcy4fcqt/image/upload/v1723532899/w3vsgsozjhhxfrn0042f.jpg'}/>
        <div className="flex justify-between">
            <img 
           className="absolute top-[5rem] left-2 h-32 w-32 rounded-full"
           src={user.avatar} alt="avatar" />
           <div className="flex flex-col">
             <p className="text-lg dark:text-white font-bold absolute left-[9.65rem] md:left-[8.5rem]">{user.username}</p>
             <div className="text-white absolute top-[9.82rem] left-[9.65rem] md:left-[8.5rem] flex space-x-2">
                <p>0subscribers</p>
                <p>0subscribed</p>
             </div>
           </div>
           <button className="bg-gray-800 text-white p-2 rounded-full shadow hover:bg-gray-700 transition"
            aria-label="Edit Channel">
           <FaEdit size={30}/>
           </button>
           
        </div>
        </section>     
    </div>
  )
}

export default Channelheader