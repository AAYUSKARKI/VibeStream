import { useSelector } from "react-redux";
import { Link, useLocation } from "react-router-dom"; // Assuming you're using react-router for navigation

function Channelnavbar() {
  const { user } = useSelector((state: any) => state?.user?.user);
  const location = useLocation();
console.log(decodeURIComponent(location.pathname))
  // Define the navigation items
  const navItems = [
    { name: "Home", Navlink: `/channel/${user.username}` },
    { name: "Playlist", Navlink: `/channel/${user.username}/playlists` },
    { name: "Tweet", Navlink: `/channel/${user.username}/tweets` },
    { name: "Subscribed", Navlink: `/channel/${user.username}/subscribed` },
  ];

  return (
    <nav className=" bg-gray-950 dark:bg-gray-950 p-4">
      <ul className="flex space-x-6 justify-around">
        {navItems.map((item, index) => {
          const isActive = decodeURIComponent(location.pathname) === item.Navlink;
          return (
            <li
              key={index}
              className={`px-4 py-2 mt-5 md:mt-6 rounded transition ${
                isActive
                  ? "bg-white text-blue-500"
                  : "text-blue-500 dark:text-white hover:text-blue-300"
              }`}
            >
              <Link to={item.Navlink}>{item.name}</Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export default Channelnavbar;
