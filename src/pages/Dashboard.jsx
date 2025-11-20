import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { FaBullhorn, FaImage, FaBell, FaCog } from "react-icons/fa"
import useBannerStore from "../stores/bannerStore"
import useAnnouncementStore from "../stores/announcementStore"
import useNotificationStore from "../stores/notificationStore"

const Dashboard = () => {
  const API_URL = process.env.REACT_APP_BACKEND_API

  const { announcements, fetchAnnouncements } = useAnnouncementStore()
  const { notifications, fetchNotifications } = useNotificationStore()
  const { banners, fetchBanners } = useBannerStore()

  // Fetch initial data
  useEffect(() => {
    fetchAnnouncements(API_URL)
    fetchNotifications(API_URL)
    fetchBanners(API_URL)
  }, [API_URL])

  // Device detection (>=860 = desktop, <860 = mobile)
  const [device, setDevice] = useState("desktop")

  useEffect(() => {
    const detect = () => {
      setDevice(window.innerWidth < 860 ? "mobile" : "desktop")
    }
    detect()
    window.addEventListener("resize", detect)
    return () => window.removeEventListener("resize", detect)
  }, [])

  // Filter banners by ACTIVE + DEVICE
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
    },
    {
      id: 2,
      label: "Banners",
      count: banners.length,
      color: "bg-blue-600",
      icon: <FaImage className="text-white text-4xl sm:text-5xl" />,
    },
    {
      id: 3,
      label: "Notifications",
      count: notifications.length,
      color: "bg-yellow-500",
      icon: <FaBell className="text-white text-4xl sm:text-5xl" />,
    },
    {
      id: 4,
      label: "Customization",
      count: 0,
      color: "bg-purple-600",
      icon: <FaCog className="text-white text-4xl sm:text-5xl" />,
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
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((item) => (
          <div
            key={item.id}
            className={`flex items-center justify-between p-4 sm:p-6 rounded-lg shadow-md h-24 sm:h-32 ${item.color}`}
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
          </div>
        ))}
      </div>

      {/* Banner Preview */}
      <div className="mt-6">
        <h1 className="font-semibold text-xl mb-4">Preview Providers</h1>

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
                transition={{ duration: 0.2, ease: "easeInOut" }}
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

        <div className="py-2 px-4 w-full rounded-md bg-white marquee-shadow flex justify-center items-center">
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
