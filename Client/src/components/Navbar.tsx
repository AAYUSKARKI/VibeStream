import { useState } from "react";
import Search from "./Search.tsx";
import Logo  from "./Logo.tsx";
import Button from "../ui/Button.tsx";
import { Link } from "react-router-dom";
import {
    IoCloseCircleOutline,
    BiLike,
    HiOutlineVideoCamera,
    SlMenu,
} from "../ui/icons.js";
import { useSelector, useDispatch } from "react-redux";
import { NavLink, useNavigate } from "react-router-dom";
import { IoMdLogOut } from "react-icons/io";
import { logoutUser } from "../redux/authslice.js";

function Navbar() {
    const [toggleMenu, setToggleMenu] = useState(false);
    const username = useSelector((state:any) => state.user?.user?.user?.username);
    const profileImg = useSelector((state:any) => state.user?.user?.user?.avatar);
    const dispatch:any = useDispatch();
    const navigate = useNavigate();

    const logout = async () => {
        await dispatch(logoutUser());
        navigate("/");
    };

    const sidePanelItems = [
        {
            icon: <BiLike size={25} />,
            title: "Liked Videos",
            url: "/liked-videos",
        },
        {
            icon: <HiOutlineVideoCamera size={25} />,
            title: "My Content",
            url: `/channel/${username}`,
        },
    ];

    return (
        <>
            <nav className="w-full dark:bg-gray-950 dark:text-white bg-gray-50 text-gray-800 flex justify-between items-center p-4 sm:gap-5 gap-2 border-b-2 border-gray-500 sticky top-0 z-50">
                <div className="flex items-center justify-center gap-2 cursor-pointer">
                    <Logo />
                </div>

                <div className="w-full sm:w-1/3 sm:block">
                    <Search />
                </div>
                {/* login and signup butons for larger screens */}
                {username ? (
                    <div className="rounded-full sm:flex items-center justify-center hidden">
                        <img
                            src={profileImg}
                            alt="profileImg"
                            className="rounded-full w-10 h-10 object-cover"
                        />
                    </div>
                ) : (
                    <div className="space-x-2 sm:block hidden">
                        <Link to={"/login"}>
                            <Button className="bg-[#222222] border hover:bg-black border-slate-500 sm:px-4 sm:py-2 p-2">
                                Login
                            </Button>
                        </Link>
                        <Link to={"/signup"}>
                            <Button className="font-semibold border hover:bg-[#222222] border-slate-500 sm:px-4 sm:py-2 ">
                                Sign up
                            </Button>
                        </Link>
                    </div>
                )}

                {/* hamburger for smaller screens */}
                <div className="sm:hidden block">
                    <div className="text-white ">
                        <SlMenu
                            size={24}
                            onClick={() => setToggleMenu((prev) => !prev)}
                        />
                    </div>
                </div>

                {/* Side bar for smaller screens */}
                {toggleMenu && (
                    <div className="fixed right-0 top-0 text-white flex flex-col border-l h-screen w-[70%] bg-[#0F0F0F] sm:hidden rounded-lg outline-none">
                        <div className="w-full border-b h-20 flex items-center mb-2 justify-between px-3">
                            <div className="flex items-center gap-2">
                                <Logo />
                            </div>
                            <IoCloseCircleOutline
                                size={35}
                                onClick={() => setToggleMenu((prev) => !prev)}
                            />
                        </div>

                        <div className="flex flex-col justify-between h-full py-5 px-3 j">
                            <div className="flex flex-col gap-5">
                                {sidePanelItems.map((item) => (
                                    <NavLink
                                        to={item.url}
                                        key={item.title}
                                        onClick={() =>
                                            setToggleMenu((prev) => !prev)
                                        }
                                        className={({ isActive }) =>
                                            isActive ? "bg-purple-500" : ""
                                        }
                                    >
                                        <div className="flex items-center border border-slate-500 gap-5 px-3 py-1 hover:bg-purple-500">
                                            <div>{item.icon}</div>
                                            <span className="text-lg">
                                                {item.title}
                                            </span>
                                        </div>
                                    </NavLink>
                                ))}
                            </div>

                            {!username ? (
                                <div className="flex flex-col space-y-5 mb-3">
                                    <Link to={"/login"}>
                                        <Button className="w-full bg-[#222222] border hover:bg-white hover:text-black border-slate-500 py-1 px-3">
                                            Login
                                        </Button>
                                    </Link>
                                    <Link to={"/signup"}>
                                        <Button className=" w-full font-semibold border border-slate-500 hover:bg-white hover:text-black py-1 px-3">
                                            Sign up
                                        </Button>
                                    </Link>
                                </div>
                            ) : (
                                <div
                                    className="flex gap-2 justify-start items-start cursor-pointer py-1 px-2 border border-slate-600"
                                    onClick={() => logout()}
                                >
                                    <IoMdLogOut size={25} />
                                    <span className="text-base">Logout</span>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </nav>
        </>
    );
}

export default Navbar;