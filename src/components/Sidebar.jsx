import React from "react"
import { NavLink, useNavigate } from "react-router-dom"
import {
  FaImage,
  FaBell,
  FaBullhorn,
  FaCog,
  FaSignOutAlt,
  FaBars,
} from "react-icons/fa"
import { MdDashboard } from "react-icons/md"

function Sidebar({ isOpen, toggleSidebar }) {
  const navigate = useNavigate()

  // 👉 LOGOUT (no backend, redirect only)
  const handleLogout = () => {
    navigate("/login")
  }

  // Menu items
  const allMenuItems = [
    {
      name: "Dashboard",
      icon: <MdDashboard className="w-6 h-6" />,
      href: "/dashboard",
      order: 1,
    },
    {
      name: "Banners",
      icon: <FaImage className="w-6 h-6" />,
      href: "/banners",
      order: 2,
    },
    {
      name: "Notifications",
      icon: <FaBell className="w-6 h-6" />,
      href: "/notifications",
      order: 3,
    },
    {
      name: "Announcements",
      icon: <FaBullhorn className="w-6 h-6" />,
      href: "/announcements",
      order: 4,
    },
    {
      name: "Customization",
      icon: <FaCog className="w-6 h-6" />,
      href: "/customization",
      order: 5,
    },
  ]

  // Desktop order
  const desktopMenuItems = [...allMenuItems].sort((a, b) => a.order - b.order)

  // Mobile centered Dashboard
  const mobileMenuItems = [
    allMenuItems.find((item) => item.order === 2),
    allMenuItems.find((item) => item.order === 3),
    allMenuItems.find((item) => item.order === 1),
    allMenuItems.find((item) => item.order === 4),
    allMenuItems.find((item) => item.order === 5),
  ]

  return (
    <>
      {/* 💻 Desktop Sidebar */}
      <aside
        className={`hidden md:flex flex-col justify-between bg-[#07114A] shadow-lg h-screen fixed top-0 left-0 px-5 py-10 transition-all duration-300 z-40
        ${isOpen ? "w-60" : "w-20"}`}
      >
        {/* Sidebar Toggle */}
        <button
          onClick={toggleSidebar}
          className="absolute top-5 right-[-15px] bg-red-600 text-white rounded-full p-2 shadow-md hover:bg-red-700 transition-colors duration-200"
        >
          <FaBars className="w-4 h-4" />
        </button>

        {/* Top section */}
        <div
          className={`${
            isOpen
              ? "space-y-10"
              : "space-y-10 flex flex-col items-center justify-center"
          }`}
        >
          <div className="text-center">
            {isOpen ? (
              <>
                <h1 className="text-white font-bold text-5xl tracking-widest mb-2">
                  CMS
                </h1>
                <p className="text-sm text-white text-nowrap overflow-hidden">
                  Content Management System
                </p>
              </>
            ) : (
              <h1 className="font-bold text-3xl tracking-widest text-white">
                C
              </h1>
            )}
          </div>

          {/* Menu Items */}
          <ul className="text-white font-medium space-y-7">
            {desktopMenuItems.map((item, index) => (
              <li key={index}>
                <NavLink
                  to={item.href}
                  className={({ isActive }) =>
                    `flex items-center gap-3 transform transition-all duration-200 ease-in-out
                    ${
                      isActive
                        ? "text-red-500 font-semibold scale-105"
                        : "hover:text-red-500 hover:scale-105"
                    }`
                  }
                >
                  <span className="flex items-center justify-center w-6 h-6">
                    {item.icon}
                  </span>
                  {isOpen && <span>{item.name}</span>}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>

        {/* 🔥 Logout Button */}
        <div className="text-white font-medium border-t border-gray-600 pt-6">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 hover:text-red-500 hover:scale-105 transform transition-all duration-200 ease-in-out w-full text-left"
          >
            <FaSignOutAlt className="w-5 h-5" />
            {isOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* 📱 Mobile Bottom Navbar */}
      <nav className="rounded-t-3xl fixed bottom-0 left-0 right-0 bg-[#07114A] flex justify-around items-center py-3 md:hidden z-50">
        {mobileMenuItems.map((item, index) => (
          <NavLink
            key={index}
            to={item.href}
            className={({ isActive }) =>
              `flex flex-col items-center text-white transform transition-all duration-200 ease-in-out
      ${
        isActive
          ? "text-white bg-red-600 scale-110 p-3 rounded-full -translate-y-3 shadow-md"
          : "hover:text-red-600 hover:scale-110"
      }`
            }
          >
            {item.icon}
          </NavLink>
        ))}
      </nav>
    </>
  )
}

export default Sidebar
