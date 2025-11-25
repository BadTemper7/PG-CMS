import { TiArrowSortedUp, TiArrowSortedDown } from "react-icons/ti" // ⭐ ADDED

import React from "react"
import { NavLink, useNavigate } from "react-router-dom"
import {
  FaImage,
  FaBell,
  FaBullhorn,
  FaCog,
  FaSignOutAlt,
  FaBars,
  FaUsers,
} from "react-icons/fa"

import { MdDashboard } from "react-icons/md"

function Sidebar({ isOpen, toggleSidebar }) {
  const navigate = useNavigate()

  const handleLogout = () => navigate("/login")

  // ⭐ Mobile Expand/Collapse
  const [isMobileExpanded, setIsMobileExpanded] = React.useState(false)
  const toggleMobile = () => setIsMobileExpanded(!isMobileExpanded)

  // MENU ITEMS
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
      name: "Providers",
      icon: <FaUsers className="w-6 h-6" />,
      href: "/providers",
      order: 5,
    },
    {
      name: "Customization",
      icon: <FaCog className="w-6 h-6" />,
      href: "/customization",
      order: 6,
    },
  ]

  const desktopMenuItems = [...allMenuItems].sort((a, b) => a.order - b.order)

  // ⭐ MOBILE — force Dashboard to always be center (slot 3)
  const dashboardItem = allMenuItems[0] // dashboard
  const mobileOthers = allMenuItems.slice(1, 5) // next 4 items
  const centeredMobileMenu = [
    mobileOthers[0],
    mobileOthers[1],
    dashboardItem, // CENTER
    mobileOthers[2],
    mobileOthers[3],
  ]

  return (
    <>
      {/* 💻 DESKTOP SIDEBAR */}
      <aside
        className={`hidden md:flex flex-col justify-between bg-[#07114A] shadow-lg h-screen fixed top-0 left-0 px-5 py-10 transition-all duration-300 z-40
            ${isOpen ? "w-60" : "w-20"}`}
      >
        <button
          onClick={toggleSidebar}
          className="absolute top-5 right-[-15px] bg-red-600 text-white rounded-full p-2 shadow-md hover:bg-red-700 transition-colors duration-200"
        >
          <FaBars className="w-4 h-4" />
        </button>

        <div
          className={`${
            isOpen ? "space-y-10" : "space-y-10 flex flex-col items-center"
          }`}
        >
          <div className="text-center">
            {isOpen ? (
              <>
                <h1 className="text-white font-bold text-5xl tracking-widest mb-2">
                  CMS
                </h1>
                <p className="text-sm text-white">Content Management System</p>
              </>
            ) : (
              <h1 className="font-bold text-3xl tracking-widest text-white">
                C
              </h1>
            )}
          </div>

          <ul className="text-white font-medium space-y-7">
            {desktopMenuItems.map((item, index) => (
              <li key={index}>
                <NavLink
                  to={item.href}
                  className={({ isActive }) =>
                    `flex items-center gap-3 transition-all duration-200
                    ${
                      isActive
                        ? "text-red-500 font-semibold scale-105"
                        : "hover:text-red-500 hover:scale-105"
                    }`
                  }
                >
                  <span className="w-6 h-6 flex items-center justify-center">
                    {item.icon}
                  </span>
                  {isOpen && <span>{item.name}</span>}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>

        <div className="text-white font-medium border-t border-gray-600 pt-6">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 hover:text-red-500 hover:scale-105 transition-all"
          >
            <FaSignOutAlt className="w-5 h-5" />
            {isOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* 📱 MOBILE NAV — Dashboard always centered */}
      <nav
        className={`fixed bottom-0 left-0 right-0 bg-[#07114A] md:hidden z-50
  flex flex-col items-center transition-all duration-300
  ${isMobileExpanded ? "h-36 pb-8" : "h-20"}`}
      >
        {/* Arrow Button */}
        <button
          onClick={toggleMobile}
          className="absolute left-1/2 -translate-x-1/2"
          style={{ top: "-22px" }}
        >
          {isMobileExpanded ? (
            <TiArrowSortedDown className="text-[#07114A] w-8 h-8" />
          ) : (
            <TiArrowSortedUp className="text-[#07114A] w-8 h-8" />
          )}
        </button>

        <div className="w-full px-4 mt-6 relative z-10">
          {/* FIRST ROW — Dashboard always item #3 */}
          <div className="flex justify-between">
            {centeredMobileMenu.map((item, index) => (
              <NavLink
                key={index}
                to={item.href}
                className={({ isActive }) =>
                  `flex flex-col items-center text-white transition-all duration-200
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
          </div>

          {/* SECOND ROW (expanded) */}
          {isMobileExpanded && (
            <div className="flex justify-center mt-4 space-x-6">
              {allMenuItems.slice(5).map((item, index) => (
                <NavLink
                  key={index}
                  to={item.href}
                  className={({ isActive }) =>
                    `flex flex-col items-center text-white transition-all duration-200
              ${
                isActive
                  ? "text-white bg-red-600 scale-110 p-3 rounded-full shadow-md"
                  : "hover:text-red-600 hover:scale-110"
              }`
                  }
                >
                  {item.icon}
                </NavLink>
              ))}
            </div>
          )}
        </div>
      </nav>
    </>
  )
}

export default Sidebar
