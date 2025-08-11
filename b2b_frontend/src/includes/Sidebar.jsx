import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { MdChatBubble, MdHome, MdPerson, MdSettings, MdClose, MdGroup, MdGroupWork, MdImage, MdVideocam, MdVideoCall,MdPersonAdd,MdHandshake,MdInsertChart } from "react-icons/md";
import Logo from '../assets/images/logo/dslogo.png';

const menu = [
  {
    title: "Main",
    items: [
      { icon: <MdHome size={20} />, label: "Home", to: "/" },
      { icon: <MdPerson size={20} />, label: "Users", to: "/users" },
      { icon: <MdGroupWork size={20} />, label: "TYFCB", to: "/tyfcb" },
      { icon: <MdPersonAdd size={20} />, label: "Referral", to: "/referral" },
      { icon: <MdHandshake size={20} />, label: "Face to Face", to: "/facetoface" },
       { icon: <MdInsertChart  size={20} />, label: "Reports", to: "/report" },
    ],
  },
  
];

const Sidebar = ({ isSidebarOpen, closeSidebar, isSidebarExpanded }) => {
  const location = useLocation();
  const [hovering, setHovering] = useState(false);
  const isDesktop = window.innerWidth >= 1024;

  // Sidebar expanded if:
  // - on mobile: always (when open)
  // - on desktop: if isSidebarExpanded is true OR hovering
  const isExpanded = isDesktop ? (isSidebarExpanded || hovering) : true;

  const handleMenuClick = () => {
    // Close sidebar on mobile when menu item is clicked
    if (window.innerWidth < 1024) {
      closeSidebar();
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Desktop Sidebar - Always visible on lg+ screens */}
      <div
        className={`hidden lg:flex h-full transition-all duration-300 ease-in-out border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg ${
          isExpanded ? "w-64" : "w-20"
        } fixed lg:relative z-30`}
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
      >
        <div className="flex flex-col w-full">
  {/* Logo Section - Fixed */}
  <div className="flex items-center justify-center h-24 py-2 border-b border-gray-200 dark:border-gray-700">
    <img
      src={Logo}
      alt="Logo"
      className={`transition-all duration-300 rounded-lg hover:scale-105 ${
        isExpanded
          ? "w-auto object-contain" // Expanded state - reduced from h-14 to h-8
          : "w-auto object-contain" // Collapsed state - reduced from h-12 to h-7
      }`}
    />
  </div>

          {/* Navigation Menu */}
          <div className="flex-1 overflow-y-auto">
            <ul className="space-y-3 p-4">
              {menu.map((section, sectionIndex) => (
                <div key={sectionIndex}>
                  {/* Section Title - Only show when expanded */}
                  {isExpanded && (
                    <div className="text-xs uppercase text-gray-500 dark:text-gray-400 font-semibold px-2 py-2 tracking-wide">
                      {section.title}
                    </div>
                  )}
                  {section.items.map((item, idx) => {
                    const isActive = location.pathname === item.to;
                    return (
                      <Link to={item.to} key={idx} onClick={handleMenuClick}>
                        <li className={`group flex items-center ${isExpanded ? 'space-x-4' : 'justify-center'} px-3 py-3 rounded-lg cursor-pointer transition-all duration-200 transform hover:scale-105 hover:shadow-lg ${
                          isActive 
                            ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg" 
                            : "text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-gray-100 hover:to-gray-50 dark:hover:from-gray-700 dark:hover:to-gray-600 hover:text-blue-600 dark:hover:text-blue-400"
                        }`}>
                          <div className={`transition-all duration-200 ${isActive ? "text-white" : "group-hover:scale-110"}`}>
                            {item.icon}
                          </div>
                          {/* Only show label when expanded */}
                          {isExpanded && (
                            <span className="font-medium">{item.label}</span>
                          )}
                        </li>
                      </Link>
                    );
                  })}
                </div>
              ))}
            </ul>
          </div>

          {/* Footer Section */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className={`text-center text-xs text-gray-500 dark:text-gray-400 transition-all duration-300 ${
              isExpanded ? "opacity-100" : "opacity-0"
            }`}>
             <p>Developed By <a className="text-blue-400" target="_blank" href="https://dsinfotechnologies.com">B2B - DS DIGITAL MEDIA</a></p>
             <p>All Rights Reserved © 2025</p>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar - Overlay */}
      <div
        className={`fixed top-0 left-0 h-full w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 z-50 transform transition-transform duration-300 ease-in-out lg:hidden shadow-2xl ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Mobile Header with Close Button */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-700">
            <div className="font-bold text-xl text-gray-900 dark:text-white">
              <img
                src={Logo}
                alt="Logo"
                className="w-32 h-10 object-contain hover:scale-105 transition-transform duration-200"
              />
            </div>
            <button
              onClick={closeSidebar}
              className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-full text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200 hover:scale-110 hover:rotate-90"
              aria-label="Close sidebar"
            >
              <MdClose size={20} />
            </button>
          </div>

          {/* Mobile Menu */}
          <div className="flex-1 overflow-y-auto">
            <ul className="space-y-3 p-4">
              {menu.map((section, sectionIndex) => (
                <div key={sectionIndex}>
                  {/* Section Title */}
                  <div className="text-xs uppercase text-gray-500 dark:text-gray-400 font-semibold px-2 py-2 tracking-wide">
                    {section.title}
                  </div>
                  {section.items.map((item, idx) => {
                    const isActive = location.pathname === item.to;
                    return (
                      <Link to={item.to} key={idx} onClick={handleMenuClick}>
                        <li className={`group flex items-center space-x-4 px-4 py-4 rounded-lg cursor-pointer transition-all duration-200 transform hover:scale-105 hover:shadow-lg ${
                          isActive
                            ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg"
                            : "text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-gray-100 hover:to-gray-50 dark:hover:from-gray-700 dark:hover:to-gray-600 hover:text-blue-600 dark:hover:text-blue-400"
                        }`}>
                          <div className={`transition-all duration-200 ${
                            isActive ? "text-white" : "group-hover:scale-110"
                          }`}>
                            {item.icon}
                          </div>
                          <span className="font-medium">{item.label}</span>
                        </li>
                      </Link>
                    );
                  })}
                </div>
              ))}
            </ul>
          </div>

          {/* Mobile Footer */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-700">
            <div className="text-center text-xs text-gray-500 dark:text-gray-400">
              © 2025 B2B - DS DIGITAL MEDIA
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;