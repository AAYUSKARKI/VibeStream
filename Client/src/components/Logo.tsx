
import { IoLogoVimeo } from "react-icons/io";
import { Link } from "react-router-dom";

function Logo({ size = "30" }) {
    return (
        <>
            <Link to={'/'} className="flex gap-2 items-center">
                <IoLogoVimeo
                    size={size}
                    color="#A855F7"
                />
                <span className="font-bold text-gray-700 dark:text-white hidden md:block">VIBESTREAM</span>
            </Link>
        </>
    );
}

export default Logo;