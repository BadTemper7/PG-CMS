import React from "react"

const CountCards = ({
  total = 0,
  active = 0,
  expired = 0,
  hidden = 0,
  onFilter,
}) => {
  return (
    <div className="grid grid-cols-4 gap-3 sm:gap-5 mb-5">
      {/* TOTAL */}
      <div
        onClick={() => onFilter("all")}
        className="bg-blue-100 border border-blue-300 rounded-lg p-4 shadow-sm cursor-pointer hover:scale-105 transition"
      >
        <h3 className="text-blue-700 font-semibold text-sm sm:text-base">
          Total
        </h3>
        <p className="text-2xl sm:text-3xl font-bold text-blue-800">{total}</p>
      </div>

      {/* ACTIVE */}
      <div
        onClick={() => onFilter("active")}
        className="bg-green-100 border border-green-300 rounded-lg p-4 shadow-sm cursor-pointer hover:scale-105 transition"
      >
        <h3 className="text-green-700 font-semibold text-sm sm:text-base">
          Active
        </h3>
        <p className="text-2xl sm:text-3xl font-bold text-green-800">
          {active}
        </p>
      </div>

      {/* EXPIRED */}
      <div
        onClick={() => onFilter("expired")}
        className="bg-red-100 border border-red-300 rounded-lg p-4 shadow-sm cursor-pointer hover:scale-105 transition"
      >
        <h3 className="text-red-700 font-semibold text-sm sm:text-base">
          Expired
        </h3>
        <p className="text-2xl sm:text-3xl font-bold text-red-800">{expired}</p>
      </div>

      {/* HIDDEN */}
      <div
        onClick={() => onFilter("hide")}
        className="bg-gray-100 border border-gray-300 rounded-lg p-4 shadow-sm cursor-pointer hover:scale-105 transition"
      >
        <h3 className="text-gray-700 font-semibold text-sm sm:text-base">
          Hidden
        </h3>
        <p className="text-2xl sm:text-3xl font-bold text-gray-800">{hidden}</p>
      </div>
    </div>
  )
}

export default CountCards
