import React, { useEffect, useState } from "react"
import { IoClose } from "react-icons/io5"
import { motion, AnimatePresence } from "framer-motion"
import { getMinDate } from "../utils/formatDate.js"

const ModalNotifications = ({ isOpen, onClose, mode, editData, onSubmit }) => {
  const [title, setTitle] = useState("")
  const [message, setMessage] = useState("")
  const [expiry, setExpiry] = useState("")
  const [status, setStatus] = useState("active")

  const maxChars = 120

  // Prefill modal when editing
  useEffect(() => {
    if (isOpen && mode === "edit" && editData) {
      setTitle(editData.title || "")
      setMessage(editData.message || "")

      // ⭐ Format expiry to yyyy-mm-dd
      if (editData.expiry) {
        const d = new Date(editData.expiry)
        setExpiry(d.toISOString().split("T")[0])
      } else {
        setExpiry("") // allow null
      }

      setStatus(editData.status || "active")
    } else if (mode === "add") {
      setTitle("")
      setMessage("")
      setExpiry("")
      setStatus("active")
    }
  }, [isOpen, mode, editData])

  // Submit Modal
  const handleSubmit = async () => {
    if (!title.trim()) return alert("Title is required!")
    if (!message.trim()) return alert("Message is required!")

    // ⭐ Always send expiry (date or null)
    const payload = {
      title,
      message,
      status,
      expiry: expiry || null,
    }

    await onSubmit(payload)
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          {/* Overlay */}
          <motion.div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            transition={{ duration: 0.25 }}
            className="relative bg-white rounded-lg shadow-lg w-[320px] sm:w-[400px] p-5 z-10"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-[16px] font-semibold text-gray-800">
                {mode === "edit" ? "Edit Notification" : "Upload Notification"}
              </h2>

              {/* Close Button */}
              <button onClick={onClose}>
                <IoClose
                  size={22}
                  className="text-gray-700 hover:text-gray-900"
                />
              </button>
            </div>

            {/* Title */}
            <label className="text-sm mb-1 block">Title</label>
            <input
              type="text"
              placeholder="Enter title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border rounded px-3 py-2 mb-4"
            />

            {/* Expiry */}
            <label className="text-sm mb-1 block">Expiry Date</label>
            <input
              type="date"
              value={expiry}
              // ⭐ FIX: only add min date in ADD mode
              min={mode === "add" ? getMinDate() : undefined}
              onChange={(e) => setExpiry(e.target.value)}
              className="w-full border rounded px-3 py-2 mb-4"
            />

            {/* Status */}
            <label className="text-sm mb-1 block">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full border rounded px-3 py-2 mb-4"
            >
              <option value="active">Active</option>
              <option value="hide">Hide</option>
              {mode === "edit" && <option value="expired">Expired</option>}
            </select>

            {/* Message */}
            <label className="text-sm mb-1 block">Message</label>
            <textarea
              rows="4"
              maxLength={maxChars}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full border rounded px-3 py-2 resize-none"
            ></textarea>

            <p className="text-xs text-right text-gray-500">
              {message.length} / {maxChars}
            </p>

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={!title.trim() || !message.trim()}
              className="mt-4 w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-300"
            >
              {mode === "edit" ? "Update" : "Post"}
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

export default ModalNotifications
