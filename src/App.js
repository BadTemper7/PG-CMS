// src/App.jsx
import React, { useState } from "react"
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom"
import Sidebar from "./components/Sidebar"
import Header from "./components/Header"
import { routes } from "./Routes"
import "./App.css"
import { Toaster } from "react-hot-toast"

function Layout() {
  const [isOpen, setIsOpen] = useState(true)
  const toggleSidebar = () => setIsOpen(!isOpen)
  const location = useLocation()

  // Hide sidebar & header on login page
  const isLoginPage = location.pathname === "/login"

  return (
    <div className="flex min-h-screen">
      {!isLoginPage && (
        <Sidebar isOpen={isOpen} toggleSidebar={toggleSidebar} />
      )}

      <main
        className={`transition-all duration-300 w-full min-h-screen
    ${isLoginPage ? "p-0 m-0" : "pt-20 pb-28 md:pb-6 p-6 px-4 md:px-14"}
    ${!isLoginPage && (isOpen ? "md:ml-60" : "md:ml-20")}
  `}
      >
        {!isLoginPage && <Header />}

        <Routes>
          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/login" />} />

          {routes.map((route, index) => (
            <Route key={index} path={route.path} element={route.element} />
          ))}
        </Routes>
      </main>
    </div>
  )
}

function App() {
  return (
    <Router>
      <Toaster position="top-right" />
      <Layout />
    </Router>
  )
}

export default App
