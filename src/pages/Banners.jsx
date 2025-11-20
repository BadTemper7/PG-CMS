import React, { useEffect, useMemo, useState } from "react"
import {
  MdDelete,
  MdEditSquare,
  MdDesktopWindows,
  MdPhoneIphone,
  MdDarkMode,
  MdLightMode,
} from "react-icons/md"

import ModalBanner from "../modals/modalBanner"
import CountCards from "../cards/countCards"
import useBannerStore from "../stores/bannerStore"
import CardDelete from "../cards/cardDelete"
import CardSuccess from "../cards/cardSuccess"
import { motion, AnimatePresence } from "framer-motion"

const API_URL = process.env.REACT_APP_BACKEND_API

const Banners = () => {
  const [showModal, setShowModal] = useState(false)
  const [mode, setMode] = useState("add")
  const [selectedBanner, setSelectedBanner] = useState(null)

  const [showDelete, setShowDelete] = useState(false)
  const [deleteId, setDeleteId] = useState(null)

  const [showBulkDelete, setShowBulkDelete] = useState(false)

  const [showSuccess, setShowSuccess] = useState(false)
  const [successData, setSuccessData] = useState({ title: "", description: "" })

  const [currentPage, setCurrentPage] = useState(1)
  const [selectedIds, setSelectedIds] = useState(new Set())
  const [filterStatus, setFilterStatus] = useState("all")

  const defaultPageSize = 5
  const [pageSize, setPageSize] = useState(defaultPageSize)

  const [openDropdown, setOpenDropdown] = useState(null)
  const [dropdownPos, setDropdownPos] = useState({ x: 0, y: 0 })

  const [previewImg, setPreviewImg] = useState(null)
  const [showPreview, setShowPreview] = useState(false)

  // ⭐ NEW FILTER FEATURE
  const [deviceFilter, setDeviceFilter] = useState("all")
  const [themeFilter, setThemeFilter] = useState("all")

  const {
    banners,
    loading,
    fetchBanners,
    deleteBanner,
    updateBanner,
    deleteManyBanners,
    updateBannerStatus,
    updateBannerTheme,
    updateBannerDevice,
  } = useBannerStore()

  const statusOptions = [
    { label: "Active", value: "active", color: "bg-green-500" },
    { label: "Hidden", value: "hide", color: "bg-gray-500" },
  ]

  const themeOptions = [
    { label: "Dark", value: "dark", color: "bg-green-500" },
    { label: "Light", value: "light", color: "bg-gray-500" },
  ]

  const deviceOptions = [
    { label: "Desktop", value: "desktop", color: "bg-green-500" },
    { label: "Mobile", value: "mobile", color: "bg-gray-500" },
  ]

  const today = new Date()

  const getStatus = (item) => {
    if (item.status === "hide") return "hidden"
    if (item.status === "active") return "active"
    if (item.expiry) {
      const expiry = new Date(item.expiry)
      return expiry < today ? "expired" : "active"
    }
    return "active"
  }

  useEffect(() => {
    fetchBanners(API_URL)
  }, [fetchBanners])

  useEffect(() => {
    const closeAll = () => setOpenDropdown(null)
    window.addEventListener("click", closeAll)
    return () => window.removeEventListener("click", closeAll)
  }, [])

  const refreshBanners = async () => {
    await fetchBanners(API_URL)
  }

  const statusClass = (status) => {
    if (status === "active") return "bg-green-100 text-green-700"
    if (status === "expired") return "bg-red-100 text-red-700"
    return "bg-gray-300 text-gray-700"
  }

  const deviceClass = (device) => {
    return device === "desktop"
      ? "bg-green-100 text-green-700"
      : "bg-gray-200 text-gray-700"
  }

  const themeClass = (theme) => {
    return theme === "dark"
      ? "bg-green-100 text-green-700"
      : "bg-gray-200 text-gray-700"
  }

  // Update status
  const handleStatusChange = async (id, newStatus) => {
    const res = await updateBannerStatus(API_URL, id, newStatus)

    if (res?.message?.toLowerCase().includes("success")) {
      setSuccessData({
        title: "Updated!",
        description: "Status updated successfully",
      })
      setShowSuccess(true)
    }

    setOpenDropdown(null)
    refreshBanners()
  }

  const handleThemeChange = async (id, newTheme) => {
    const res = await updateBannerTheme(API_URL, id, newTheme)

    if (res?.message?.toLowerCase().includes("success")) {
      setSuccessData({
        title: "Updated!",
        description: "Theme updated successfully",
      })
      setShowSuccess(true)
    }

    setOpenDropdown(null)
    refreshBanners()
  }

  const handleDeviceChange = async (id, newDevice) => {
    const res = await updateBannerDevice(API_URL, id, newDevice)

    if (res?.message?.toLowerCase().includes("success")) {
      setSuccessData({
        title: "Updated!",
        description: "Device updated successfully",
      })
      setShowSuccess(true)
    }

    setOpenDropdown(null)
    refreshBanners()
  }

  const { activeCount, expiredCount, hiddenCount } = useMemo(() => {
    let active = 0,
      expired = 0,
      hidden = 0
    banners.forEach((b) => {
      const s = getStatus(b)
      if (s === "active") active++
      if (s === "expired") expired++
      if (s === "hidden") hidden++
    })
    return { activeCount: active, expiredCount: expired, hiddenCount: hidden }
  }, [banners])

  const statusFilterMap = {
    all: "all",
    active: "active",
    expired: "expired",
    hide: "hidden",
  }

  // ⭐ NEW FILTER LOGIC INCLUDED HERE
  const filteredBanners = useMemo(() => {
    let sorted = [...banners].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    )

    // STATUS filter
    if (filterStatus !== "all") {
      sorted = sorted.filter(
        (item) => getStatus(item) === statusFilterMap[filterStatus]
      )
    }

    // DEVICE filter
    if (deviceFilter !== "all") {
      sorted = sorted.filter((item) => item.device === deviceFilter)
    }

    // THEME filter
    if (themeFilter !== "all") {
      sorted = sorted.filter((item) => item.theme === themeFilter)
    }

    return sorted
  }, [banners, filterStatus, deviceFilter, themeFilter])

  const totalPages = Math.max(1, Math.ceil(filteredBanners.length / pageSize))

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredBanners.slice(start, start + pageSize)
  }, [filteredBanners, currentPage, pageSize])

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  const confirmDelete = async () => {
    const res = await deleteBanner(API_URL, deleteId)
    setSuccessData({
      title: "Deleted!",
      description: res.message,
    })
    setShowSuccess(true)
    setShowDelete(false)
    setDeleteId(null)
  }

  const handleBulkDelete = async () => {
    const ids = Array.from(selectedIds)
    if (ids.length === 0) return

    const res = await deleteManyBanners(API_URL, { ids })

    if (res?.message?.toLowerCase().includes("success")) {
      setSuccessData({
        title: "Deleted!",
        description: res.message,
      })
      setShowSuccess(true)
    }

    setShowBulkDelete(false)
    setSelectedIds(new Set())
  }

  const toggleSelectOne = (id) => {
    const newSet = new Set(selectedIds)
    newSet.has(id) ? newSet.delete(id) : newSet.add(id)
    setSelectedIds(newSet)
  }

  const getFilteredIds = () => filteredBanners.map((item) => item._id)

  const toggleSelectAll = () => {
    const ids = getFilteredIds()
    const allSelected = ids.every((id) => selectedIds.has(id))

    const newSet = new Set(selectedIds)
    if (allSelected) ids.forEach((id) => newSet.delete(id))
    else ids.forEach((id) => newSet.add(id))

    setSelectedIds(newSet)
  }

  const getBreadcrumb = () => {
    const map = {
      active: "Active",
      expired: "Expired",
      hide: "Hidden",
      all: "All",
    }
    return map[filterStatus]
  }

  return (
    <div className="w-full">
      <div className="flex items-center gap-2 mb-2">
        <h2 className="text-lg font-bold">Banners</h2>
        <span className="text-gray-500 text-sm">&gt; {getBreadcrumb()}</span>
      </div>

      <CountCards
        total={banners.length}
        active={activeCount}
        expired={expiredCount}
        hidden={hiddenCount}
        onFilter={(status) => {
          setFilterStatus(status)
          setCurrentPage(1)
        }}
      />

      <div className="mt-4 mb-6 flex flex-col md:flex-row gap-4">
        {/* DEVICE FILTER */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Device:</span>

          {[
            { label: "All", value: "all", icon: null },
            { label: "Desktop", value: "desktop", icon: <MdDesktopWindows /> },
            { label: "Mobile", value: "mobile", icon: <MdPhoneIphone /> },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => {
                setDeviceFilter(opt.value)
                setCurrentPage(1)
              }}
              className={`
          flex items-center gap-1 px-3 py-1.5 rounded-full text-sm transition
          border shadow-sm
          ${
            deviceFilter === opt.value
              ? "bg-blue-600 text-white border-blue-600 shadow-md"
              : "bg-white text-gray-600 hover:bg-gray-100"
          }
        `}
            >
              {opt.icon && <span className="text-base">{opt.icon}</span>}
              {opt.label}
            </button>
          ))}
        </div>

        {/* THEME FILTER */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Theme:</span>

          {[
            { label: "All", value: "all", icon: null },
            { label: "Dark", value: "dark", icon: <MdDarkMode /> },
            { label: "Light", value: "light", icon: <MdLightMode /> },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => {
                setThemeFilter(opt.value)
                setCurrentPage(1)
              }}
              className={`
          flex items-center gap-1 px-3 py-1.5 rounded-full text-sm transition
          border shadow-sm
          ${
            themeFilter === opt.value
              ? "bg-blue-600 text-white border-blue-600 shadow-md"
              : "bg-white text-gray-600 hover:bg-gray-100"
          }
        `}
            >
              {opt.icon && <span className="text-base">{opt.icon}</span>}
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Rows per page */}
      <div className="flex items-center justify-end mb-4 gap-3">
        <div className="flex items-center gap-2">
          <label className="text-sm">Rows per page:</label>
          <input
            type="number"
            min={1}
            placeholder="5"
            className="border rounded px-2 py-1 w-20"
            value={pageSize === defaultPageSize ? "" : pageSize}
            onChange={(e) => {
              const val = Number(e.target.value)
              if (!val) setPageSize(defaultPageSize)
              else setPageSize(val)
              setCurrentPage(1)
            }}
          />
        </div>

        {selectedIds.size > 0 && (
          <button
            onClick={() => setShowBulkDelete(true)}
            className="px-5 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
          >
            Delete Selected ({selectedIds.size})
          </button>
        )}

        <button
          onClick={() => {
            setMode("add")
            setSelectedBanner(null)
            setShowModal(true)
          }}
          className="font-semibold text-white bg-blue-600 py-2 px-6 rounded hover:scale-105 transition"
        >
          Upload
        </button>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto shadow-sm border rounded-md">
        <table className="min-w-full text-sm text-gray-700">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3 text-left">
                <input
                  type="checkbox"
                  checked={
                    filteredBanners.length > 0 &&
                    filteredBanners.every((a) => selectedIds.has(a._id))
                  }
                  onChange={toggleSelectAll}
                />
              </th>

              <th className="py-3 px-4 text-left">#</th>
              <th className="py-3 px-4 text-center">Banner</th>
              <th className="py-3 px-4 text-left">Uploaded By</th>
              <th className="py-3 px-4 text-left">Created At</th>
              <th className="py-3 px-4 text-left">Expiry</th>
              <th className="py-3 px-4 text-center">Device</th>
              <th className="py-3 px-4 text-center">Theme</th>
              <th className="py-3 px-4 text-center">Status</th>
              <th className="py-3 px-4 text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={10} className="py-4 text-center text-gray-500">
                  Loading...
                </td>
              </tr>
            ) : paginated.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-4 text-center text-gray-500">
                  No banners found.
                </td>
              </tr>
            ) : (
              paginated.map((item, index) => {
                const s = getStatus(item)

                return (
                  <tr key={item._id} className="border-b hover:bg-gray-50">
                    {/* Checkbox */}
                    <td className="py-3 px-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(item._id)}
                        onChange={() => toggleSelectOne(item._id)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </td>

                    <td className="py-3 px-4">
                      {(currentPage - 1) * pageSize + index + 1}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <div className="flex justify-center">
                        <img
                          src={item.url}
                          onClick={(e) => {
                            e.stopPropagation()
                            setPreviewImg(item.url)
                            setShowPreview(true)
                          }}
                          className="w-40 rounded shadow-sm cursor-pointer hover:scale-105 transition"
                        />
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      {item.uploadedBy?.username || "Unknown"}
                    </td>

                    <td className="py-3 px-4">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </td>

                    <td className="py-3 px-4">
                      {item.expiry
                        ? new Date(item.expiry).toLocaleDateString()
                        : "—"}
                    </td>

                    {/* DEVICE DROPDOWN */}
                    <td className="py-3 px-4 text-center relative">
                      <span
                        onClick={(e) => {
                          e.stopPropagation()
                          const rect = e.target.getBoundingClientRect()
                          setDropdownPos({
                            x: rect.left + rect.width / 2,
                            y: rect.bottom + 6,
                          })
                          setOpenDropdown(`device-${item._id}`)
                        }}
                        className={`${deviceClass(
                          item.device
                        )} px-3 py-1 rounded text-xs cursor-pointer inline-flex items-center gap-2`}
                      >
                        {item.device === "desktop" ? (
                          <MdDesktopWindows className="text-base" />
                        ) : (
                          <MdPhoneIphone className="text-base" />
                        )}
                        {(item.device || "desktop").charAt(0).toUpperCase() +
                          (item.device || "desktop").slice(1)}
                      </span>

                      {openDropdown === `device-${item._id}` && (
                        <div
                          onClick={(e) => e.stopPropagation()}
                          className="fixed z-50 bg-white border rounded-lg shadow-xl py-2 w-40 animate-dropdown"
                          style={{
                            top: dropdownPos.y,
                            left: dropdownPos.x,
                            transform: "translateX(-50%)",
                          }}
                        >
                          <div className="flex justify-end px-2">
                            <button
                              onClick={() => setOpenDropdown(null)}
                              className="text-gray-500 hover:text-gray-800 text-lg leading-none"
                            >
                              ×
                            </button>
                          </div>

                          {deviceOptions.map((opt) => (
                            <button
                              key={opt.value}
                              onClick={() =>
                                handleDeviceChange(item._id, opt.value)
                              }
                              className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-gray-100 transition text-sm"
                            >
                              {opt.value === "desktop" ? (
                                <MdDesktopWindows className="text-base" />
                              ) : (
                                <MdPhoneIphone className="text-base" />
                              )}
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </td>

                    {/* THEME DROPDOWN */}
                    <td className="py-3 px-4 text-center relative">
                      <span
                        onClick={(e) => {
                          e.stopPropagation()
                          const rect = e.target.getBoundingClientRect()
                          setDropdownPos({
                            x: rect.left + rect.width / 2,
                            y: rect.bottom + 6,
                          })
                          setOpenDropdown(`theme-${item._id}`)
                        }}
                        className={`${themeClass(
                          item.theme
                        )} px-3 py-1 rounded text-xs cursor-pointer inline-flex items-center gap-2`}
                      >
                        {item.theme === "dark" ? (
                          <MdDarkMode className="text-base" />
                        ) : (
                          <MdLightMode className="text-base" />
                        )}
                        {(item.theme || "light").charAt(0).toUpperCase() +
                          (item.theme || "light").slice(1)}
                      </span>

                      {openDropdown === `theme-${item._id}` && (
                        <div
                          onClick={(e) => e.stopPropagation()}
                          className="fixed z-50 bg-white border rounded-lg shadow-xl py-2 w-40 animate-dropdown"
                          style={{
                            top: dropdownPos.y,
                            left: dropdownPos.x,
                            transform: "translateX(-50%)",
                          }}
                        >
                          <div className="flex justify-end px-2">
                            <button
                              onClick={() => setOpenDropdown(null)}
                              className="text-gray-500 hover:text-gray-800 text-lg leading-none"
                            >
                              ×
                            </button>
                          </div>

                          {themeOptions.map((opt) => (
                            <button
                              key={opt.value}
                              onClick={() =>
                                handleThemeChange(item._id, opt.value)
                              }
                              className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-gray-100 transition text-sm"
                            >
                              {opt.value === "dark" ? (
                                <MdDarkMode className="text-base" />
                              ) : (
                                <MdLightMode className="text-base" />
                              )}
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </td>

                    {/* STATUS DROPDOWN */}
                    <td className="py-3 px-4 text-center relative">
                      <span
                        onClick={(e) => {
                          e.stopPropagation()
                          const rect = e.target.getBoundingClientRect()
                          setDropdownPos({
                            x: rect.left + rect.width / 2,
                            y: rect.bottom + 6,
                          })
                          setOpenDropdown(`status-${item._id}`)
                        }}
                        className={`${statusClass(
                          s
                        )} px-3 py-1 rounded text-xs cursor-pointer inline-flex items-center gap-2`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full ${
                            s === "active"
                              ? "bg-green-500"
                              : s === "expired"
                              ? "bg-red-500"
                              : "bg-gray-500"
                          }`}
                        ></span>
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                      </span>

                      {openDropdown === `status-${item._id}` && (
                        <div
                          onClick={(e) => e.stopPropagation()}
                          className="fixed z-50 bg-white border rounded-lg shadow-xl py-2 w-40 animate-dropdown"
                          style={{
                            top: dropdownPos.y,
                            left: dropdownPos.x,
                            transform: "translateX(-50%)",
                          }}
                        >
                          <div className="flex justify-end px-2">
                            <button
                              onClick={() => setOpenDropdown(null)}
                              className="text-gray-500 hover:text-gray-800 text-lg leading-none"
                            >
                              ×
                            </button>
                          </div>

                          {statusOptions.map((opt) => (
                            <button
                              key={opt.value}
                              onClick={() =>
                                handleStatusChange(item._id, opt.value)
                              }
                              className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-gray-100 transition text-sm"
                            >
                              <span
                                className={`w-2 h-2 rounded-full ${opt.color}`}
                              ></span>
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </td>

                    {/* ACTIONS */}
                    <td className="py-3 px-4 text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          className="p-2 bg-blue-500 text-white rounded hover:scale-110 transition"
                          onClick={(e) => {
                            e.stopPropagation()
                            setMode("edit")
                            setSelectedBanner(item)
                            setShowModal(true)
                          }}
                        >
                          <MdEditSquare />
                        </button>

                        <button
                          className="p-2 bg-red-500 text-white rounded hover:scale-110 transition"
                          onClick={(e) => {
                            e.stopPropagation()
                            setDeleteId(item._id)
                            setShowDelete(true)
                          }}
                        >
                          <MdDelete />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      <div className="flex justify-end mt-5 mb-3">
        <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-md shadow-sm border text-sm">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1 rounded text-blue-600 disabled:text-gray-400"
          >
            Prev
          </button>

          {(() => {
            const pages = []

            if (currentPage > 2) {
              pages.push(1)
              if (currentPage > 3) pages.push("...")
            }

            const start = Math.max(1, currentPage - 1)
            const end = Math.min(totalPages, currentPage + 1)

            for (let i = start; i <= end; i++) {
              pages.push(i)
            }

            if (currentPage < totalPages - 2) {
              pages.push("...")
              pages.push(totalPages)
            }

            return pages.map((p, i) =>
              p === "..." ? (
                <span key={"dots-" + i} className="px-2 text-gray-500">
                  ...
                </span>
              ) : (
                <button
                  key={p}
                  onClick={() => handlePageChange(p)}
                  className={`w-8 h-8 flex items-center justify-center rounded ${
                    currentPage === p
                      ? "bg-blue-600 text-white"
                      : "text-gray-600 hover:bg-blue-50"
                  }`}
                >
                  {p}
                </button>
              )
            )
          })()}

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-1 rounded text-blue-600 disabled:text-gray-400"
          >
            Next
          </button>
        </div>
      </div>

      {/* DELETE CONFIRM */}
      {showBulkDelete && (
        <CardDelete
          message="Delete all selected banners?"
          onCancel={() => setShowBulkDelete(false)}
          onConfirm={handleBulkDelete}
        />
      )}

      {showDelete && (
        <CardDelete
          message="This banner will be permanently deleted."
          onCancel={() => setShowDelete(false)}
          onConfirm={confirmDelete}
        />
      )}

      {/* SUCCESS */}
      {showSuccess && (
        <CardSuccess
          title={successData.title}
          description={successData.description}
          onClose={() => setShowSuccess(false)}
        />
      )}

      {/* MODAL */}
      {showModal && (
        <ModalBanner
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          refresh={refreshBanners}
          mode={mode}
          bannerData={selectedBanner}
          onSuccess={(msg) => {
            setSuccessData({
              title: mode === "edit" ? "Updated!" : "Success!",
              description: msg,
            })
            setShowSuccess(true)
          }}
        />
      )}

      {/* IMAGE PREVIEW */}
      <AnimatePresence>
        {showPreview && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center z-[9999]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="absolute inset-0 bg-black/50 backdrop-blur-md"
              onClick={() => setShowPreview(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            <motion.img
              src={previewImg}
              className="max-w-[90%] max-h-[90%] object-contain rounded-lg relative z-10"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Banners
