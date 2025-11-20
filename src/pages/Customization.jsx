import React from "react"
import { FaTools } from "react-icons/fa"

const Customization = () => {
  return (
    <div className="flex flex-col items-center justify-center h-[80vh] text-center space-y-6">
      <div className="flex flex-col items-center">
        <FaTools className="text-6xl text-red-600 animate-pulse mb-4" />
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">
          Customization Page
        </h1>
        <p className="text-gray-500 text-lg mt-2">
          This feature is currently under development.
        </p>
      </div>
    </div>
  )
}

export default Customization
