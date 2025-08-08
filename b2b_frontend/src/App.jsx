import React, { useState, useEffect } from "react";
import Sidebar from "./includes/Sidebar";
import Navbar from "./includes/Navbar";
import { Outlet } from "react-router-dom";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

const App = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // for mobile
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true); // for large screens

  const [isLoading, setIsLoading] = useState(true);

  // Simulate loading state
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  // Close sidebar when clicking outside on mobile
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      closeSidebar();
    }
  };

  const toggleDesktopSidebar = () => {
  setIsSidebarExpanded((prev) => !prev);
};


  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white dark:bg-gray-900">
        <div className="flex flex-col items-center space-y-4">
          {/* Loading Spinner */}
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 dark:border-blue-800 rounded-full animate-spin"></div>
            <div className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-t-blue-600 rounded-full animate-spin"></div>
          </div>
          
          {/* Loading Text */}
          <div className="text-gray-600 dark:text-gray-300 font-medium">
            Loading...
          </div>
          
          {/* Loading Bar */}
          <div className="w-48 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
      <ToastContainer />
      {/* Mobile Overlay with enhanced effects */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-40 lg:hidden transition-all duration-300 animate-fadeIn"
          onClick={handleOverlayClick}
          style={{
            animation: 'fadeIn 0.3s ease-out'
          }}
        />
      )}

      {/* Sidebar */}
      <Sidebar 
        isSidebarOpen={isSidebarOpen} 
        closeSidebar={closeSidebar}
        isSidebarExpanded={isSidebarExpanded} // ✅ new prop
      />

      
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Navbar */}
        <Navbar toggleSidebar={toggleSidebar} toggleDesktopSidebar={toggleDesktopSidebar} />
        
        {/* Main Content Area */}
        <main className="p-2 flex-1 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 overflow-auto transition-all duration-300">
          {/* Content Container with hover effects */}
           <div className="min-h-[calc(100vh-4rem)] bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-200 dark:border-gray-700 overflow-visible">
            {/* Content Header Bar */}
            {/* <div className="h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div> */}
            
            {/* Content Body */}
            <div className="p-2 h-full">
              <Outlet/>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;