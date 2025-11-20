import React, { useEffect, useMemo, useState } from "react"
import { MdDelete, MdEditSquare } from "react-icons/md"
import ModalAnnouncements from "../modals/modalAnnouncements"
import CountCards from "../cards/countCards"
import useAnnouncementStore from "../stores/announcementStore"
import { formatDate, formatDateTime } from "../utils/formatDate"
import CardSuccess from "../cards/cardSuccess"
import CardDelete from "../cards/cardDelete"

const Announcements = () => {
  const [showModal, setShowModal] = useState(false)
  const [modalMode, setModalMode] = useState("")
  const [announcementDetails, setAnnouncementDetails] = useState(null)

  const [showDelete, setShowDelete] = useState(false)
  const [deleteId, setDeleteId] = useState(null)

  const [showBulkDelete, setShowBulkDelete] = useState(false)

  const [showSuccess, setShowSuccess] = useState(false)
  const [successData, setSuccessData] = useState({ title: "", description: "" })

  const [currentPage, setCurrentPage] = useState(1)
  const [filterStatus, setFilterStatus] = useState("all")

  const [editingStatusId, setEditingStatusId] = useState(null)
  const [dropdownPos, setDropdownPos] = useState({ x: 0, y: 0 })

  const [selectedIds, setSelectedIds] = useState(new Set())

  const defaultPageSize = 5
  const [pageSize, setPageSize] = useState(defaultPageSize)

  const API_URL = process.env.REACT_APP_BACKEND_API

  const {
    announcements,
    loading,
    fetchAnnouncements,
    addAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
    deleteManyAnnouncements,
  } = useAnnouncementStore()

  const statusOptions = [
    { label: "Active", value: "active", color: "bg-green-500" },
    { label: "Hidden", value: "hide", color: "bg-gray-500" },
  ]

  useEffect(() => {
    fetchAnnouncements(API_URL)
  }, [API_URL])

  const handleAdd = async (newData) => {
    const res = await addAnnouncement(API_URL, newData)
    if (res?.message?.toLowerCase().includes("success")) {
      setSuccessData({ title: "Success!", description: res.message })
      setShowSuccess(true)
    }
    setShowModal(false)
  }

  const handleUpdate = async (updated) => {
    const res = await updateAnnouncement(
      API_URL,
      announcementDetails._id,
      updated
    )

    if (res?.message?.toLowerCase().includes("success")) {
      setSuccessData({ title: "Updated!", description: res.message })
      setShowSuccess(true)
    }
    setShowModal(false)
  }

  const handleStatusChange = async (id, newStatus) => {
    const res = await updateAnnouncement(API_URL, id, { status: newStatus })

    if (res?.message?.toLowerCase().includes("success")) {
      setSuccessData({
        title: "Updated!",
        description: "Status updated successfully",
      })
      setShowSuccess(true)
    }
    setEditingStatusId(null)
  }

  const confirmDelete = async () => {
    const res = await deleteAnnouncement(API_URL, deleteId)

    if (res?.message?.toLowerCase().includes("success")) {
      setSuccessData({ title: "Deleted!", description: res.message })
      setShowSuccess(true)
    }

    setShowDelete(false)
    setDeleteId(null)
  }

  // ⭐ APPLY NOTIFICATIONS LOGIC HERE — FIX DELETE MANY FORMAT
  const confirmBulkDelete = async () => {
    const idsToDelete = Array.from(selectedIds)
    if (idsToDelete.length === 0) return

    const res = await deleteManyAnnouncements(API_URL, { ids: idsToDelete })

    if (res?.message?.toLowerCase().includes("success")) {
      setSuccessData({
        title: "Deleted!",
        description: res.message,
      })
      setShowSuccess(true)
    }

    setSelectedIds(new Set())
    setShowBulkDelete(false)
  }

  useEffect(() => {
    const close = () => setEditingStatusId(null)
    document.addEventListener("click", close)
    return () => document.removeEventListener("click", close)
  }, [])

  const today = new Date()

  const getStatus = (item) => {
    if (item.status === "hide") return "hidden"
    if (item.status === "active") return "active"
    if (item.status === "expired") return "expired"

    const expiry = new Date(item.expiry)
    return expiry < today ? "expired" : "active"
  }

  const statusFilterMap = {
    all: "all",
    active: "active",
    expired: "expired",
    hide: "hidden",
  }

  const { activeCount, expiredCount, hiddenCount } = useMemo(() => {
    let active = 0,
      expired = 0,
      hidden = 0

    announcements.forEach((item) => {
      const s = getStatus(item)
      if (s === "active") active++
      if (s === "expired") expired++
      if (s === "hidden") hidden++
    })

    return { activeCount: active, expiredCount: expired, hiddenCount: hidden }
  }, [announcements])

  const filteredAnnouncements = useMemo(() => {
    if (filterStatus === "all") return announcements
    return announcements.filter(
      (item) => getStatus(item) === statusFilterMap[filterStatus]
    )
  }, [announcements, filterStatus])

  const totalPages = Math.max(
    1,
    Math.ceil(filteredAnnouncements.length / pageSize)
  )

  const paginatedAnnouncements = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredAnnouncements.slice(start, start + pageSize)
  }, [filteredAnnouncements, currentPage, pageSize])

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  const getFilteredIds = () => filteredAnnouncements.map((item) => item._id)

  const toggleSelectOne = (id) => {
    const newSet = new Set(selectedIds)
    newSet.has(id) ? newSet.delete(id) : newSet.add(id)
    setSelectedIds(newSet)
  }

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
        <h2 className="text-lg font-bold">Announcements</h2>
        <span className="text-gray-500 text-sm">&gt; {getBreadcrumb()}</span>
      </div>

      <CountCards
        total={announcements.length}
        active={activeCount}
        expired={expiredCount}
        hidden={hiddenCount}
        onFilter={(status) => {
          setFilterStatus(status)
          setCurrentPage(1)
        }}
      />

      {/* ACTION BAR */}
      <div className="flex items-center justify-end mb-4 gap-3">
        {/* ROWS PER PAGE */}
        <div className="flex items-center gap-2 ">
          <label className="text-sm">Rows per page:</label>
          <input
            type="number"
            min={1}
            placeholder="5"
            className="border rounded px-2 py-1 w-20"
            value={pageSize === defaultPageSize ? "" : pageSize}
            onChange={(e) => {
              const val = Number(e.target.value)
              setPageSize(val || defaultPageSize)
              setCurrentPage(1)
            }}
          />
        </div>

        {/* BULK DELETE */}
        {selectedIds.size > 0 ? (
          <button
            onClick={() => setShowBulkDelete(true)}
            className="px-5 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
          >
            Delete Selected ({selectedIds.size})
          </button>
        ) : (
          <div></div>
        )}

        {/* ADD BUTTON */}
        <button
          onClick={() => {
            setModalMode("add")
            setAnnouncementDetails(null)
            setShowModal(true)
          }}
          className="px-5 py-2 bg-blue-600 text-white rounded hover:scale-105 transition"
        >
          Upload
        </button>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto border shadow-sm rounded-md">
        {loading ? (
          <div className="py-8 text-center text-gray-500">Loading...</div>
        ) : (
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={
                      filteredAnnouncements.length > 0 &&
                      filteredAnnouncements.every((a) => selectedIds.has(a._id))
                    }
                    onChange={toggleSelectAll}
                  />
                </th>

                <th className="px-4 py-3 text-left">#</th>
                <th className="px-4 py-3 text-left">Announcement</th>
                <th className="px-4 py-3 text-left">Created At</th>
                <th className="px-4 py-3 text-left">Expiry</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>

            <tbody>
              {paginatedAnnouncements.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="py-6 text-center text-gray-500 italic"
                  >
                    No announcements found.
                  </td>
                </tr>
              ) : (
                paginatedAnnouncements.map((item, index) => {
                  const st = getStatus(item)

                  return (
                    <tr
                      key={item._id}
                      className="border-b hover:bg-gray-50 transition"
                    >
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(item._id)}
                          onChange={() => toggleSelectOne(item._id)}
                        />
                      </td>

                      <td className="px-4 py-3">
                        {(currentPage - 1) * pageSize + index + 1}
                      </td>

                      <td className="px-4 py-3">{item.desc}</td>

                      <td className="px-4 py-3">
                        {formatDateTime(item.createdAt)}
                      </td>

                      <td className="px-4 py-3">{formatDate(item.expiry)}</td>

                      <td className="px-4 py-3 text-center relative">
                        <span
                          onClick={(e) => {
                            e.stopPropagation()
                            const rect = e.target.getBoundingClientRect()
                            setDropdownPos({
                              x: rect.left + rect.width / 2,
                              y: rect.bottom + 6,
                            })
                            setEditingStatusId(item._id)
                          }}
                          className={`px-3 py-1 inline-flex items-center gap-2 justify-center rounded text-xs border cursor-pointer
                            ${
                              st === "active"
                                ? "bg-green-100 text-green-700"
                                : st === "expired"
                                ? "bg-red-100 text-red-700"
                                : "bg-gray-300 text-gray-700"
                            }
                          `}
                        >
                          <span
                            className={`w-2 h-2 rounded-full ${
                              st === "active"
                                ? "bg-green-500"
                                : st === "expired"
                                ? "bg-red-500"
                                : "bg-gray-500"
                            }`}
                          ></span>
                          {st.charAt(0).toUpperCase() + st.slice(1)}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-center">
                        <div className="flex justify-center gap-2">
                          <button
                            className="p-2 bg-blue-500 text-white rounded hover:scale-110 transition"
                            onClick={() => {
                              setModalMode("edit")
                              setAnnouncementDetails(item)
                              setShowModal(true)
                            }}
                          >
                            <MdEditSquare />
                          </button>

                          <button
                            className="p-2 bg-red-500 text-white rounded hover:scale-110 transition"
                            onClick={() => {
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
        )}
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

      {/* MODALS */}
      {showBulkDelete && (
        <CardDelete
          message="Are you sure you want to delete these selected announcements?"
          onCancel={() => setShowBulkDelete(false)}
          onConfirm={confirmBulkDelete}
        />
      )}

      {showDelete && (
        <CardDelete
          message="This announcement will be permanently deleted."
          onCancel={() => setShowDelete(false)}
          onConfirm={confirmDelete}
        />
      )}

      {showModal && (
        <ModalAnnouncements
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          mode={modalMode}
          announceArray={announcementDetails}
          onSubmit={modalMode === "edit" ? handleUpdate : handleAdd}
        />
      )}

      {showSuccess && (
        <CardSuccess
          title={successData.title}
          description={successData.description}
          onClose={() => setShowSuccess(false)}
        />
      )}

      {/* STATUS DROPDOWN */}
      {editingStatusId && (
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
              onClick={() => setEditingStatusId(null)}
              className="text-gray-500 hover:text-gray-800 text-lg leading-none"
            >
              ×
            </button>
          </div>

          {statusOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => handleStatusChange(editingStatusId, opt.value)}
              className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-gray-100 transition text-sm"
            >
              <span className={`w-2 h-2 rounded-full ${opt.color}`}></span>
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default Announcements
