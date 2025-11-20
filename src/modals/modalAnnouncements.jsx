import React, { useState, useEffect } from "react"
import { IoClose } from "react-icons/io5"
import { motion, AnimatePresence } from "framer-motion"
import { getMinDate } from "../utils/formatDate"

const ModalAnnouncements = ({
  isOpen,
  onClose,
  mode,
  announceArray,
  onSubmit,
}) => {
  const [announcement, setAnnouncement] = useState("")
  const [expiry, setExpiry] = useState("")
  const [status, setStatus] = useState("active")

  const maxChars = 120

  // Prefill fields in edit mode
  useEffect(() => {
    if (isOpen && mode === "edit" && announceArray) {
      setAnnouncement(announceArray.desc || "")

      // Format expiry => yyyy-mm-dd
      if (announceArray.expiry) {
        const d = new Date(announceArray.expiry)
        setExpiry(d.toISOString().split("T")[0])
      } else {
        setExpiry("") // allow null
      }

      setStatus(announceArray.status || "active")
    }

    if (isOpen && mode === "add") {
      setAnnouncement("")
      setExpiry("")
      setStatus("active")
    }
  }, [isOpen, mode, announceArray])

  // Submit handler
  const handleSubmit = async () => {
    if (!announcement.trim()) return alert("Announcement is required!")

    // Validate only for ADD
    if (mode === "add" && expiry && expiry < getMinDate()) {
      return alert("Expiry date must be later than today.")
    }

    // Always send expiry (date or null)
    const payload = {
      desc: announcement,
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
          <motion.div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          <motion.div
            className="relative bg-white rounded-lg shadow-lg w-[320px] sm:w-[400px] p-5 z-10"
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold text-gray-800">
                {mode === "edit" ? "Edit Announcement" : "Upload Announcement"}
              </h2>
              <IoClose size={22} onClick={onClose} className="cursor-pointer" />
            </div>

            {/* Expiry */}
            <label className="block text-sm mb-1">Expiry Date (Optional)</label>
            <input
              type="date"
              value={expiry}
              // ⭐ FIX: allow expired dates in edit mode
              min={mode === "add" ? getMinDate() : undefined}
              onChange={(e) => setExpiry(e.target.value)}
              className="w-full border rounded px-3 py-2 mb-4"
            />

            {/* Status */}
            <label className="block text-sm mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full border rounded px-3 py-2 mb-4"
            >
              <option value="active">Active</option>
              <option value="hide">Hidden</option>
            </select>

            {/* Announcement */}
            <label className="block text-sm mb-1">Announcement</label>
            <textarea
              rows="4"
              maxLength={maxChars}
              value={announcement}
              onChange={(e) => setAnnouncement(e.target.value)}
              className="w-full border rounded px-3 py-2 resize-none"
            ></textarea>
            <p className="text-xs text-gray-500 text-right">
              {announcement.length} / {maxChars}
            </p>

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={!announcement.trim()}
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

export default ModalAnnouncements
