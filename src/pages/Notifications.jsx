import React, { useEffect, useMemo, useState } from "react"
import { MdDelete, MdEditSquare } from "react-icons/md"
import ModalNotifications from "../modals/modalNotifications"
import CountCards from "../cards/countCards"
import useNotificationStore from "../stores/notificationStore"
import { formatDate } from "../utils/formatDate"
import CardDelete from "../cards/cardDelete"
import CardSuccess from "../cards/cardSuccess"

const Notifications = () => {
  const [showModal, setShowModal] = useState(false)
  const [modalMode, setModalMode] = useState("add")
  const [editData, setEditData] = useState(null)

  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteId, setDeleteId] = useState(null)

  const [showBulkDelete, setShowBulkDelete] = useState(false)

  const [showSuccess, setShowSuccess] = useState(false)
  const [successData, setSuccessData] = useState({
    title: "",
    description: "",
  })

  const [filterStatus, setFilterStatus] = useState("all")

  const [currentPage, setCurrentPage] = useState(1)

  // ⭐ ADD ROW PER PAGE
  const defaultPageSize = 5
  const [pageSize, setPageSize] = useState(defaultPageSize)

  const [editingStatusId, setEditingStatusId] = useState(null)
  const [dropdownPos, setDropdownPos] = useState({ x: 0, y: 0 })

  const [selectedIds, setSelectedIds] = useState(new Set())

  const API_URL = process.env.REACT_APP_BACKEND_API

  const {
    notifications,
    loading,
    fetchNotifications,
    createNotification,
    updateNotification,
    deleteNotification,
    deleteManyNotifications,
  } = useNotificationStore()

  const statusOptions = [
    { label: "Active", value: "active", color: "bg-green-500" },
    { label: "Hidden", value: "hide", color: "bg-gray-500" },
  ]

  useEffect(() => {
    fetchNotifications(API_URL)
  }, [API_URL])

  const today = new Date()

  const getStatus = (item) => {
    if (item.status === "hide") return "Hidden"
    if (item.status === "expired") return "Expired"

    if (!item.expiry) return "Active"
    const exp = new Date(item.expiry)

    if (isNaN(exp.getTime())) return "Active"
    return exp < today ? "Expired" : "Active"
  }

  const statusMap = {
    Active: "active",
    Expired: "expired",
    Hidden: "hide",
  }

  const { activeCount, expiredCount, hiddenCount } = useMemo(() => {
    let active = 0,
      expired = 0,
      hidden = 0

    notifications.forEach((item) => {
      const s = getStatus(item)
      if (s === "Active") active++
      if (s === "Expired") expired++
      if (s === "Hidden") hidden++
    })

    return { activeCount: active, expiredCount: expired, hiddenCount: hidden }
  }, [notifications])

  const filtered = useMemo(() => {
    if (filterStatus === "all") return notifications

    return notifications.filter(
      (item) => statusMap[getStatus(item)] === filterStatus
    )
  }, [notifications, filterStatus])

  // ⭐ USE DYNAMIC PAGE SIZE
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filtered.slice(start, start + pageSize)
  }, [filtered, currentPage, pageSize])

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page)
  }

  const handleAdd = async (payload) => {
    const res = await createNotification(API_URL, payload)

    if (res?.message?.includes("successfully")) {
      setSuccessData({ title: "Success!", description: res.message })
      setShowSuccess(true)
    }

    setShowModal(false)
  }

  const handleUpdate = async (payload) => {
    const res = await updateNotification(API_URL, editData._id, payload)

    if (res?.message?.includes("successfully")) {
      setSuccessData({ title: "Updated!", description: res.message })
      setShowSuccess(true)
    }

    setShowModal(false)
  }

  const handleStatusChange = async (id, newStatus) => {
    const res = await updateNotification(API_URL, id, { status: newStatus })

    if (res?.message?.includes("successfully")) {
      setSuccessData({
        title: "Updated!",
        description: "Status updated successfully",
      })
      setShowSuccess(true)
    }

    setEditingStatusId(null)
  }

  const confirmDelete = async () => {
    const res = await deleteNotification(API_URL, deleteId)

    if (res?.message?.includes("successfully")) {
      setSuccessData({ title: "Deleted!", description: res.message })
      setShowSuccess(true)
    }

    setDeleteOpen(false)
    setDeleteId(null)
  }

  const confirmBulkDelete = async () => {
    const idsToDelete = [...selectedIds]

    if (idsToDelete.length === 0) return

    const res = await deleteManyNotifications(API_URL, idsToDelete)

    if (res?.message?.includes("success")) {
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

  const getFilteredIds = () => filtered.map((item) => item._id)

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

  const getStatusClass = (s) => {
    if (s === "Active") return "bg-green-100 text-green-700"
    if (s === "Expired") return "bg-red-100 text-red-700"
    return "bg-gray-300 text-gray-700"
  }

  const breadcrumbText =
    filterStatus === "all"
      ? "All"
      : filterStatus.charAt(0).toUpperCase() + filterStatus.slice(1)

  return (
    <div className="w-full">
      <div className="flex items-center gap-2 mb-2">
        <h2 className="text-lg font-bold">Notifications</h2>
        <span className="text-gray-500 text-sm">&gt; {breadcrumbText}</span>
      </div>

      <CountCards
        total={notifications.length}
        active={activeCount}
        expired={expiredCount}
        hidden={hiddenCount}
        onFilter={(status) => {
          setFilterStatus(status)
          setCurrentPage(1)
        }}
      />

      {/* ⭐ BULK DELETE + ADD BUTTON */}
      <div className="flex justify-end gap-4 mb-4">
        {/* ⭐ ROWS PER PAGE INPUT */}
        <div className="flex items-center gap-2">
          <label className="text-sm">Rows per page:</label>
          <input
            type="number"
            min={1}
            placeholder="5"
            className="border rounded px-2 py-1 w-20"
            value={pageSize === defaultPageSize ? "" : pageSize}
            onChange={(e) => {
              const v = Number(e.target.value)
              setPageSize(v || defaultPageSize)
              setCurrentPage(1)
            }}
          />
        </div>

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

        <button
          onClick={() => {
            setModalMode("add")
            setEditData(null)
            setShowModal(true)
          }}
          className="bg-blue-600 text-white px-5 py-2 rounded hover:scale-105 transition"
        >
          Upload
        </button>
      </div>

      <div className="border rounded shadow-sm overflow-x-auto">
        {loading ? (
          <div className="py-6 text-center text-gray-500">Loading...</div>
        ) : (
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-left">
                  <input
                    type="checkbox"
                    checked={
                      filtered.length > 0 &&
                      filtered.every((a) => selectedIds.has(a._id))
                    }
                    onChange={toggleSelectAll}
                  />
                </th>

                <th className="p-3 text-left">#</th>
                <th className="p-3 text-left">Title</th>
                <th className="p-3 text-left">Message</th>
                <th className="p-3 text-left">Created</th>
                <th className="p-3 text-left">Expiry</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>

            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="py-6 text-center text-gray-500 italic"
                  >
                    No notifications found.
                  </td>
                </tr>
              ) : (
                paginated.map((item, idx) => {
                  const status = getStatus(item)

                  return (
                    <tr key={item._id} className="border-b hover:bg-gray-50">
                      <td className="p-3">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(item._id)}
                          onChange={() => toggleSelectOne(item._id)}
                        />
                      </td>

                      <td className="p-3">
                        {(currentPage - 1) * pageSize + idx + 1}
                      </td>

                      <td className="p-3">{item.title}</td>
                      <td className="p-3">{item.message}</td>
                      <td className="p-3">{formatDate(item.createdAt)}</td>
                      <td className="p-3">{formatDate(item.expiry)}</td>

                      <td className="p-3 text-center">
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
                          className={`px-3 py-1 rounded cursor-pointer border inline-flex gap-2 items-center justify-center ${getStatusClass(
                            status
                          )}`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full ${
                              status === "Active"
                                ? "bg-green-500"
                                : status === "Expired"
                                ? "bg-red-500"
                                : "bg-gray-500"
                            }`}
                          ></span>
                          {status}
                        </span>
                      </td>

                      <td className="p-3 text-center">
                        <div className="flex gap-2 justify-center">
                          <button
                            className="p-1 bg-blue-500 text-white rounded hover:scale-110 transition"
                            onClick={() => {
                              setEditData(item)
                              setModalMode("edit")
                              setShowModal(true)
                            }}
                          >
                            <MdEditSquare />
                          </button>

                          <button
                            className="p-1 bg-red-500 text-white rounded hover:scale-110 transition"
                            onClick={() => {
                              setDeleteId(item._id)
                              setDeleteOpen(true)
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

      {/* ⭐ UPDATED PAGINATION WITH ELLIPSIS */}
      <div className="flex justify-end mt-4">
        <div className="flex gap-2 bg-white px-3 py-2 border rounded shadow-sm">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="text-sm px-2 py-1 rounded disabled:text-gray-400"
          >
            Prev
          </button>

          {/* ⭐ DYNAMIC PAGINATION BUTTONS */}
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
              if (currentPage < totalPages - 2) pages.push("...")
              pages.push(totalPages)
            }

            return pages.map((p, i) => {
              if (p === "...") {
                return (
                  <span key={"dots-" + i} className="px-2 text-gray-500">
                    ...
                  </span>
                )
              }

              return (
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
            })
          })()}

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="text-sm px-2 py-1 rounded disabled:text-gray-400"
          >
            Next
          </button>
        </div>
      </div>

      {showBulkDelete && (
        <CardDelete
          message="Are you sure you want to delete these selected notifications?"
          onCancel={() => setShowBulkDelete(false)}
          onConfirm={confirmBulkDelete}
        />
      )}

      {deleteOpen && (
        <CardDelete
          message="Are you sure you want to delete this notification?"
          onCancel={() => setDeleteOpen(false)}
          onConfirm={confirmDelete}
        />
      )}

      {showModal && (
        <ModalNotifications
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          mode={modalMode}
          editData={editData}
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

export default Notifications
