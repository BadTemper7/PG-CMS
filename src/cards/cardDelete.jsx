import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MdDeleteForever } from "react-icons/md";

const CardDelete = ({ message, onConfirm, onCancel }) => {
  return (
    <AnimatePresence>
      <div className="fixed inset-0 flex items-center justify-center z-[9999]">
        {/* BACKDROP */}
        <motion.div
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          onClick={onCancel}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />

        {/* MODAL */}
        <motion.div
          className="relative bg-white rounded-lg shadow-lg w-[320px] sm:w-[380px] px-6 py-8 z-10 border border-red-300"
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
        >
          <div className="flex flex-col items-center text-center">
            <MdDeleteForever size={80} className="text-red-600 mb-2" />

            <h3 className="text-2xl font-bold text-red-700">Delete?</h3>

            <p className="text-gray-600 mt-2">{message}</p>

            <div className="flex gap-3 mt-6">
              <button
                onClick={onCancel}
                className="px-4 py-2 border rounded text-gray-700 bg-gray-200 hover:bg-gray-300 transition"
              >
                Cancel
              </button>

              <button
                onClick={onConfirm}
                className="px-4 py-2 rounded text-white bg-red-600 hover:bg-red-700 transition"
              >
                Confirm
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CardDelete;
