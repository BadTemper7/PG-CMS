import React from "react"

const ProviderCountCards = ({
  total = 0,
  newCount = 0,
  topCount = 0,
  hiddenCount = 0,
  onFilter,
}) => {
  return (
    <div className="grid grid-cols-4 gap-3 sm:gap-5 mb-5">
      {/* TOTAL */}
      <div
        onClick={() => onFilter("all")}
        className=" bg-gray-100 border border-gray-300  rounded-lg p-4 shadow-sm cursor-pointer hover:scale-105 transition"
      >
        <h3 className="font-semibold text-sm sm:text-base">Total</h3>
        <p className="text-2xl sm:text-3xl font-bold ">{total}</p>
      </div>

      {/* NEW */}
      <div
        onClick={() => onFilter("new")}
        className="bg-gray-100 border border-gray-300  rounded-lg p-4 shadow-sm cursor-pointer hover:scale-105 transition"
      >
        <h3 className=" font-semibold text-sm sm:text-base">New</h3>
        <p className="text-2xl sm:text-3xl font-bold ">{newCount}</p>
      </div>

      {/* TOP */}
      <div
        onClick={() => onFilter("top")}
        className="bg-gray-100 border border-gray-300  rounded-lg p-4 shadow-sm cursor-pointer hover:scale-105 transition"
      >
        <h3 className=" font-semibold text-sm sm:text-base">Top</h3>
        <p className="text-2xl sm:text-3xl font-bold ">{topCount}</p>
      </div>

      {/* HIDDEN */}
      <div
        onClick={() => onFilter("hidden")}
        className="bg-gray-100 border border-gray-300 rounded-lg p-4 shadow-sm cursor-pointer hover:scale-105 transition"
      >
        <h3 className="text-gray-700 font-semibold text-sm sm:text-base">
          Hidden
        </h3>
        <p className="text-2xl sm:text-3xl font-bold text-gray-800">
          {hiddenCount}
        </p>
      </div>
    </div>
  )
}

export default ProviderCountCards
