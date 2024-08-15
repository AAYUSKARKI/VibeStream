import Channelheader from "./Channelheader"
import Sidebar from "./Sidebar"
import Channelnavbar from "./Channelnavbar"
function Mychannel() {
  return (
    <>
    <div className="flex w-full">
    <Sidebar/>
    <div className="flex flex-col w-full">
      <Channelheader/> 
      <Channelnavbar/>
    </div>
    </div>
    </>
  )
}

export default Mychannel