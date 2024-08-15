import { useDispatch, useSelector } from "react-redux";
import { settheme } from "../redux/themeslice";
import { useEffect, useState } from "react";
import { FaSun, FaMoon } from "react-icons/fa";

function ThemeSwitcher() {
  const dispatch = useDispatch();
  const { theme } = useSelector((state: any) => state.theme);

  // State to track scroll direction
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Apply the theme to the body element
  useEffect(() => {
    document.documentElement.className = theme;
  }, [theme]);

  // Toggle the theme
  const toggleTheme = () => {
    dispatch(settheme(theme === "light" ? "dark" : "light"));
  };

  // Handle scroll event
  const handleScroll = () => {
    if (window.scrollY > lastScrollY) {
      // If scrolling down, hide the button
      setIsVisible(false);
    } else {
      // If scrolling up, show the button
      setIsVisible(true);
    }
    setLastScrollY(window.scrollY);
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [lastScrollY]);

  return (
    <div
      className={`fixed right-4 top-1/2 transform -translate-y-1/2 z-50 transition-opacity duration-300 ease-in-out ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
    >
      <button
        onClick={toggleTheme}
        className="bg-gray-200 dark:bg-gray-700 p-3 rounded-full shadow-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-300 ease-in-out"
        aria-label="Toggle Theme"
      >
        {theme === "light" ? (
          <FaMoon size={24} className="text-gray-800 dark:text-gray-200" />
        ) : (
          <FaSun size={24} className="text-yellow-500 dark:text-yellow-300" />
        )}
      </button>
    </div>
  );
}

export default ThemeSwitcher;
