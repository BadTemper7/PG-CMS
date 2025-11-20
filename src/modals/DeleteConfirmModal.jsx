import React from "react";
import { motion, AnimatePresence } from "framer-motion";

const DeleteConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Delete Confirmation",
  message,
  confirmText = "Delete",
  cancelText = "Cancel",
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50">
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.85, opacity: 0 }}
            className="bg-white rounded-lg p-6 w-[320px] sm:w-[360px] shadow-lg"
          >
            {/* Modal Title */}
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              {title}
            </h2>

            {/* Modal Message */}
            <p className="text-sm text-gray-600 mb-4 leading-relaxed">
              {message}
            </p>

            {/* Buttons */}
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-sm"
              >
                {cancelText}
              </button>

              <button
                onClick={onConfirm}
                className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white text-sm"
              >
                {confirmText}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default DeleteConfirmModal;
