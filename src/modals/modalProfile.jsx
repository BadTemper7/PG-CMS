import React from "react";
import { FaSignOutAlt, FaUser } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const ModalProfile = ({ isOpen, onClose, onLogout }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
          className="absolute top-14 right-0 bg-white text-gray-800 shadow-xl rounded-lg w-52 z-50 border border-gray-200"
        >
          <ul className="divide-y divide-gray-200">
            <li className="flex items-center gap-2 px-4 py-3 font-semibold text-gray-700">
              <FaUser className="text-[#07114A]" />
              Tamahome
            </li>

            <li>
              <button
                onClick={onLogout}
                className="flex items-center gap-2 w-full text-left px-4 py-3 hover:bg-red-100 text-red-600 font-medium"
              >
                <FaSignOutAlt /> Logout
              </button>
            </li>
          </ul>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ModalProfile;
