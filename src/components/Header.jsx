import React, { useState, useEffect, useRef } from "react";
import { FaUserCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import ModalProfile from "../modals/modalProfile";

const Header = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const modalRef = useRef(null);
  const navigate = useNavigate();

  const toggleModal = () => setIsModalOpen((prev) => !prev);

  const handleLogout = () => {
    localStorage.clear(); // optional
    navigate("/login");
  };

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setIsModalOpen(false);
      }
    };

    if (isModalOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isModalOpen]);

  return (
    <header className="fixed top-0 left-0 w-full bg-[#07114A] text-white flex items-center justify-between px-5 py-3 shadow-md md:hidden z-50">
      <h1 className="text-2xl font-bold tracking-widest">CMS</h1>

      <div className="relative" ref={modalRef}>
        <FaUserCircle
          className="text-3xl cursor-pointer hover:scale-110 transition-transform"
          onClick={toggleModal}
        />

        <ModalProfile
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onLogout={handleLogout}
        />
      </div>
    </header>
  );
};

export default Header;
