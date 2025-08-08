import { useEffect, useState } from "react";
import { MdDarkMode, MdLightMode, MdMenu, MdNotifications, MdAccountCircle, MdLogout } from "react-icons/md";
import { useAuth } from "../context/AuthContext";

const Navbar = ({ toggleSidebar, toggleDesktopSidebar }) => {
  const [darkMode, setDarkMode] = useState(false);
  const [mounted, setMounted] = useState(false);
  const {logout} = useAuth();

  // Initialize theme on mount
  useEffect(() => {
    setMounted(true);
    
    // Check system preference first, then localStorage
    const getInitialTheme = () => {
      if (typeof window !== 'undefined') {
        const savedTheme = localStorage.getItem("theme");
        if (savedTheme) {
          return savedTheme === "dark";
        }
        // Fallback to system preference
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
      }
      return false;
    };

    const initialDarkMode = getInitialTheme();
    setDarkMode(initialDarkMode);
    
    // Apply theme immediately
    const root = document.documentElement;
    if (initialDarkMode) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, []);

  // Apply theme changes
  useEffect(() => {
    if (!mounted) return;

    const root = document.documentElement;
    
    if (darkMode) {
      root.classList.add("dark");
      try {
        localStorage.setItem("theme", "dark");
      } catch (error) {
        console.warn("Failed to save theme to localStorage:", error);
      }
    } else {
      root.classList.remove("dark");
      try {
        localStorage.setItem("theme", "light");
      } catch (error) {
        console.warn("Failed to save theme to localStorage:", error);
      }
    }
    
    // Force a repaint to ensure styles apply
    root.style.colorScheme = darkMode ? 'dark' : 'light';
  }, [darkMode, mounted]);

  const toggleDarkMode = () => {
    setDarkMode(prev => !prev);
  };

  // Fixed handleToggleSidebar function
  const handleToggleSidebar = () => {
    console.log('Hamburger clicked!'); // Debug log
    
    // Check screen size and call appropriate function
    if (window.innerWidth < 1024) {
      // Mobile: toggle sidebar overlay
      if (toggleSidebar && typeof toggleSidebar === 'function') {
        toggleSidebar();
      } else {
        console.error('toggleSidebar function not provided or not a function');
      }
    } else {
      // Desktop: toggle sidebar expansion
      if (toggleDesktopSidebar && typeof toggleDesktopSidebar === 'function') {
        toggleDesktopSidebar();
      } else {
        console.error('toggleDesktopSidebar function not provided or not a function');
      }
    }
  };

  return (
    <div className="h-16 flex items-center justify-between px-6 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm backdrop-blur-sm">
      {/* Left Section */}
      <div className="flex items-center space-x-4">
        {/* Hamburger Menu Button */}
        <button 
          onClick={handleToggleSidebar}
          className="group relative p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-700 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          aria-label="Toggle sidebar"
        >
          <MdMenu size={24} className="transition-transform duration-200 group-hover:rotate-180"/>
          
          {/* Tooltip */}
          <div className="absolute left-1/2 transform -translate-x-1/2 top-full mt-2 bg-gray-900 dark:bg-gray-700 text-white px-2 py-1 rounded text-xs font-medium opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 whitespace-nowrap">
            Menu
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900 dark:bg-gray-700 rotate-45 mb-1"></div>
          </div>
        </button>

        {/* Title */}
        <h1 className="font-bold text-lg text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 cursor-default">
          Dashboard
        </h1>
      </div>

      {/* Right Section */}
      <div className="flex items-center space-x-2">
        {/* Notifications Button */}
        {/* <button 
          className="group relative p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:text-yellow-600 dark:hover:text-yellow-400 transition-all duration-200 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-opacity-50"
          aria-label="Notifications"
        >
          <MdNotifications size={20} className="transition-transform duration-200 group-hover:animate-bounce"/>
          
          <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white rounded-full text-xs flex items-center justify-center font-bold animate-pulse">
            3
          </span>
          <div className="absolute right-0 top-full mt-2 bg-gray-900 dark:bg-gray-700 text-white px-2 py-1 rounded text-xs font-medium opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 whitespace-nowrap">
            Notifications
            <div className="absolute bottom-full right-2 w-2 h-2 bg-gray-900 dark:bg-gray-700 rotate-45 mb-1"></div>
          </div>
        </button> */}

        {/* Profile Button */}
        <button 
          onClick={logout}
          className="group relative p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200 hover:bg-green-50 dark:hover:bg-green-900/20 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
          aria-label="Profile"
        >
          <MdLogout size={20} className="transition-transform duration-200 group-hover:rotate-12"/>

          {/* Tooltip */}
          <div className="absolute right-0 top-full mt-2 bg-gray-900 dark:bg-gray-700 text-white px-2 py-1 rounded text-xs font-medium opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 whitespace-nowrap">
            Logout
            <div className="absolute bottom-full right-2 w-2 h-2 bg-gray-900 dark:bg-gray-700 rotate-45 mb-1"></div>
          </div>
        </button>

        {/* Dark Mode Toggle Button */}
        <button 
          onClick={toggleDarkMode}
          className="group relative p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-yellow-400 transition-all duration-200 hover:bg-purple-50 dark:hover:bg-yellow-900/20 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-yellow-500 focus:ring-opacity-50"
          aria-label="Toggle dark mode"
        >
          <div className="relative">
            {darkMode ? (
              <MdLightMode size={20} className="transition-all duration-300 group-hover:rotate-180 group-hover:text-yellow-500"/>
            ) : (
              <MdDarkMode size={20} className="transition-all duration-300 group-hover:-rotate-12 group-hover:text-purple-600"/>
            )}
          </div>

          {/* Tooltip */}
          <div className="absolute right-0 top-full mt-2 bg-gray-900 dark:bg-gray-700 text-white px-2 py-1 rounded text-xs font-medium opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 whitespace-nowrap">
            {darkMode ? 'Light Mode' : 'Dark Mode'}
            <div className="absolute bottom-full right-4 w-2 h-2 bg-gray-900 dark:bg-gray-700 rotate-45 mb-1"></div>
          </div>
        </button>
      </div>
    </div>
  );
};

export default Navbar;