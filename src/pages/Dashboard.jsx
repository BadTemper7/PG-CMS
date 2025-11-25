import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { FaBullhorn, FaImage, FaBell, FaCog, FaDatabase } from "react-icons/fa"
import { useNavigate } from "react-router-dom"

import useBannerStore from "../stores/bannerStore"
import useAnnouncementStore from "../stores/announcementStore"
import useNotificationStore from "../stores/notificationStore"
import useProviderStore from "../stores/providerStore"

const Dashboard = () => {
  const navigate = useNavigate()

  const API_URL = process.env.REACT_APP_BACKEND_API

  const { announcements, fetchAnnouncements } = useAnnouncementStore()
  const { notifications, fetchNotifications } = useNotificationStore()
  const { banners, fetchBanners } = useBannerStore()
  const { providers, getSlotsProviderList } = useProviderStore()

  // Fetch initial data
  useEffect(() => {
    fetchAnnouncements(API_URL)
    fetchNotifications(API_URL)
    fetchBanners(API_URL)
    getSlotsProviderList(API_URL)
  }, [API_URL])

  // Device detection
  const [device, setDevice] = useState("desktop")
  useEffect(() => {
    const detect = () => {
      setDevice(window.innerWidth < 860 ? "mobile" : "desktop")
    }
    detect()
    window.addEventListener("resize", detect)
    return () => window.removeEventListener("resize", detect)
  }, [])

  // Active banners
  const activeBanners = banners.filter(
    (b) => b.status === "active" && b.device === device
  )

  // Banner auto-rotation
  const [currentIndex, setCurrentIndex] = useState(0)
  useEffect(() => {
    if (activeBanners.length > 0) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % activeBanners.length)
      }, 5000)
      return () => clearInterval(interval)
    }
  }, [activeBanners.length])

  const variants = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  }

  // Stats
  const stats = [
    {
      id: 1,
      label: "Announcements",
      count: announcements.length,
      color: "bg-green-600",
      icon: <FaBullhorn className="text-white text-4xl sm:text-5xl" />,
      href: "/announcements",
    },
    {
      id: 2,
      label: "Banners",
      count: banners.length,
      color: "bg-blue-600",
      icon: <FaImage className="text-white text-4xl sm:text-5xl" />,
      href: "/banners",
    },
    {
      id: 3,
      label: "Notifications",
      count: notifications.length,
      color: "bg-yellow-500",
      icon: <FaBell className="text-white text-4xl sm:text-5xl" />,
      href: "/notifications",
    },
    {
      id: 4,
      label: "Providers",
      count: providers.length,
      color: "bg-red-600",
      icon: <FaDatabase className="text-white text-4xl sm:text-5xl" />,
      href: "/providers",
    },
    {
      id: 5,
      label: "Customization",
      count: 0,
      color: "bg-purple-600",
      icon: <FaCog className="text-white text-4xl sm:text-5xl" />,
      href: "/customization",
    },
  ]

  // Announcements marquee
  const activeAnnouncements = announcements.filter((a) => a.status === "active")

  const marqueeText =
    activeAnnouncements.length > 0
      ? activeAnnouncements.map((a) => a.desc).join("   |   ")
      : "No active announcements available"

  return (
    <div className="space-y-6">
      <h2 className="text-lg sm:text-xl font-bold mb-4">Dashboard</h2>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
        {stats.map((item) => (
          <motion.div
            key={item.id}
            whileHover={{ y: -8, scale: 1.03 }}
            transition={{ duration: 0.25 }}
            onClick={() => navigate(item.href)}
            className={`cursor-pointer flex items-center justify-between p-4 sm:p-6 rounded-lg shadow-lg h-24 sm:h-32 ${item.color}`}
          >
            <div>{item.icon}</div>
            <div className="flex flex-col items-end text-white">
              <span className="text-2xl sm:text-3xl font-bold leading-none">
                {item.count}
              </span>
              <span className="text-xs sm:text-sm opacity-90">
                {item.label}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Banner Preview */}
      <div className="mt-6">
        <h1 className="font-semibold text-xl mb-4">Preview Banners</h1>

        <div className="relative w-full overflow-hidden rounded-lg flex justify-center">
          {activeBanners.length > 0 ? (
            <AnimatePresence mode="wait">
              <motion.img
                key={activeBanners[currentIndex].id}
                src={activeBanners[currentIndex].url}
                alt={activeBanners[currentIndex].alt}
                variants={variants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className="w-full h-auto object-contain rounded-lg"
              />
            </AnimatePresence>
          ) : (
            <p>No active {device} banners available</p>
          )}
        </div>
      </div>

      {/* Announcements Marquee */}
      <div className="mt-6">
        <h1 className="font-semibold text-xl mb-4">Preview Announcements</h1>

        <div className="py-2 px-4 w-full rounded-md bg-white shadow flex justify-center items-center">
          <marquee
            direction="left"
            scrollamount="10"
            className="announcement-marquee"
          >
            {marqueeText}
          </marquee>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
