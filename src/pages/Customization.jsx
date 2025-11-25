import React, { useState, useEffect, useRef } from "react"
import { FaCheck } from "react-icons/fa"
import { IoClose } from "react-icons/io5"
import { FiUploadCloud } from "react-icons/fi"

const Customization = () => {
  const [activeTab, setActiveTab] = useState("sidebar") // sidebar | background

  // ============================
  // DEFAULT COLORS
  // ============================
  const defaultSidebarColors = [
    "#1E90FF",
    "#3498db",
    "#2ecc71",
    "#27ae60",
    "#e67e22",
    "#f39c12",
    "#e74c3c",
    "#9b59b6",
    "#16a085",
    "#34495e",
  ]

  const defaultBackgroundColors = [
    "#e1efff",
    "#dff7e8",
    "#fde5e5",
    "#fff0d9",
    "#f4eaff",
    "#eaf0ff",
    "#eafff6",
    "#f2ffe6",
    "#ffe9f2",
    "#ecf9ff",
  ]

  // ============================
  // LOCAL STORAGE LOADER
  // ============================
  const loadLocal = (key, fallback) => {
    const saved = localStorage.getItem(key)
    return saved ? JSON.parse(saved) : fallback
  }

  // Custom Colors
  const [customSidebar, setCustomSidebar] = useState(
    loadLocal("customSidebar", [])
  )
  const [customBackground, setCustomBackground] = useState(
    loadLocal("customBackground", [])
  )

  // Selected Colors
  const [selectedSidebar, setSelectedSidebar] = useState(
    loadLocal("selectedSidebar", "#1E90FF")
  )
  const [selectedBackground, setSelectedBackground] = useState(
    loadLocal("selectedBackground", "#e1efff")
  )

  // Custom color field
  const [customColorInput, setCustomColorInput] = useState("#ffffff")

  // ============================
  // IMAGE UPLOADER STATES
  // ============================
  const [previewUrl, setPreviewUrl] = useState(loadLocal("previewUrl", ""))
  const [fileName, setFileName] = useState(loadLocal("fileName", ""))
  const fileInputRef = useRef()

  // ============================
  // SAVE TO LOCAL STORAGE
  // ============================
  useEffect(() => {
    localStorage.setItem("customSidebar", JSON.stringify(customSidebar))
  }, [customSidebar])

  useEffect(() => {
    localStorage.setItem("customBackground", JSON.stringify(customBackground))
  }, [customBackground])

  useEffect(() => {
    localStorage.setItem("selectedSidebar", JSON.stringify(selectedSidebar))
  }, [selectedSidebar])

  useEffect(() => {
    localStorage.setItem(
      "selectedBackground",
      JSON.stringify(selectedBackground)
    )
  }, [selectedBackground])

  useEffect(() => {
    localStorage.setItem("previewUrl", JSON.stringify(previewUrl))
  }, [previewUrl])

  useEffect(() => {
    localStorage.setItem("fileName", JSON.stringify(fileName))
  }, [fileName])

  // ============================
  // COLOR LIST HANDLERS
  // ============================
  const getColors = () => {
    return activeTab === "sidebar"
      ? [...defaultSidebarColors, ...customSidebar]
      : [...defaultBackgroundColors, ...customBackground]
  }

  const handleColorSelect = (color) => {
    if (activeTab === "sidebar") setSelectedSidebar(color)
    else setSelectedBackground(color)
  }

  // Add custom color
  const addCustomColor = () => {
    const color = customColorInput.toLowerCase()

    if (!/^#([0-9a-f]{3}){1,2}$/i.test(color)) {
      alert("Invalid HEX color")
      return
    }

    if (activeTab === "sidebar") {
      if (!customSidebar.includes(color)) {
        const updated = [...customSidebar, color]
        setCustomSidebar(updated)
      }
    } else {
      if (!customBackground.includes(color)) {
        const updated = [...customBackground, color]
        setCustomBackground(updated)
      }
    }
  }

  // Remove a custom color
  const removeCustomColor = (color) => {
    if (activeTab === "sidebar") {
      setCustomSidebar(customSidebar.filter((c) => c !== color))
    } else {
      setCustomBackground(customBackground.filter((c) => c !== color))
    }
  }

  // ============================
  // IMAGE UPLOAD HANDLERS
  // ============================
  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    validateAndLoadImage(file)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (!file) return
    validateAndLoadImage(file)
  }

  const validateAndLoadImage = (file) => {
    const validTypes = ["image/jpeg", "image/jpg", "image/webp"]
    if (!validTypes.includes(file.type)) {
      alert("Only JPEG, JPG, or WEBP allowed")
      return
    }

    if (file.size > 1024 * 1024) {
      alert("Max size is 1MB")
      return
    }

    setFileName(file.name)

    const reader = new FileReader()
    reader.onload = () => setPreviewUrl(reader.result)
    reader.readAsDataURL(file)
  }

  const handleRemoveImage = () => {
    setPreviewUrl("")
    setFileName("")
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  // ============================
  // JSX
  // ============================
  return (
    <div className="flex w-full gap-6">
      {/* LEFT SECTION */}
      <div className="flex flex-col w-1/2 gap-5">
        {/* Title */}
        <div>
          <h1 className="font-bold text-2xl mb-2">Appearance</h1>

          <p className="text-sm  text-gray-400">
            Customize your sidebar and dashboard colors to match your brand.
          </p>
          <p className="text-sm  text-gray-400">
            Upload your logo or background.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex items-center bg-gray-100 rounded-full p-1 w-fit">
          <button
            onClick={() => setActiveTab("sidebar")}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
              activeTab === "sidebar"
                ? "bg-white shadow text-gray-900"
                : "text-gray-500"
            }`}
          >
            Sidebar Color
          </button>

          <button
            onClick={() => setActiveTab("background")}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
              activeTab === "background"
                ? "bg-white shadow text-gray-900"
                : "text-gray-500"
            }`}
          >
            Background Color
          </button>
        </div>

        {/* Color Options */}
        <div className="grid grid-cols-5 gap-4 mt-2 w-60">
          {getColors().map((color) => {
            const isSelected =
              (activeTab === "sidebar" && selectedSidebar === color) ||
              (activeTab === "background" && selectedBackground === color)

            const isCustom =
              customSidebar.includes(color) || customBackground.includes(color)

            return (
              <div key={color} className="relative">
                {/* X remove button (custom colors only) */}
                {isCustom && (
                  <button
                    onClick={() => removeCustomColor(color)}
                    className="absolute -top-2 -right-2 z-30 bg-white rounded-full p-1 shadow hover:bg-gray-200"
                  >
                    <IoClose size={12} className="text-red-500" />
                  </button>
                )}

                {/* Color circle */}
                <div
                  onClick={() => handleColorSelect(color)}
                  className="w-10 h-10 rounded-full cursor-pointer flex items-center justify-center transition hover:scale-110 relative"
                  style={{ background: color }}
                >
                  {/* Selected overlay */}
                  {isSelected && (
                    <div className="absolute inset-0 bg-black/20 rounded-full flex items-center justify-center z-20">
                      <FaCheck className="text-white text-sm" />
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Custom Color Creator */}
        <div className="flex items-center gap-3 mt-4">
          {/* Circle Picker */}
          <div className="relative w-10 h-10">
            <div
              className="absolute inset-0 rounded-full border shadow"
              style={{ background: customColorInput }}
            ></div>

            <input
              type="color"
              value={customColorInput}
              onChange={(e) => setCustomColorInput(e.target.value)}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
          </div>

          {/* HEX Input */}
          <input
            type="text"
            value={customColorInput}
            onChange={(e) => setCustomColorInput(e.target.value)}
            placeholder="#hexcolor"
            className="border px-3 py-2 rounded-lg text-sm shadow-sm w-28"
          />

          {/* Add Button */}
          <button
            onClick={addCustomColor}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm shadow hover:bg-blue-700"
          >
            Add
          </button>
        </div>

        {/* Drag and Drop Image Upload */}
        <div className="flex flex-col">
          <h1 className="font-semibold">Upload Logo</h1>
          <p className="text-sm text-gray-400 mt-1">
            Add your company logo to personalize your dashboard.
          </p>

          <div
            className="w-80 mt-6 border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition"
            onClick={() => fileInputRef.current.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
          >
            {previewUrl ? (
              <div className="relative w-full">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="max-h-40 rounded-md object-contain w-full"
                />

                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleRemoveImage()
                  }}
                  className="absolute top-2 right-2 bg-white/80 p-1 rounded-full shadow"
                >
                  <IoClose size={16} />
                </button>

                <p className="text-sm mt-2 text-gray-600 truncate">
                  {fileName}
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center text-gray-500">
                <FiUploadCloud className="text-4xl text-gray-400 mb-3" />

                <p className="text-sm font-medium text-gray-700 mb-1">
                  Upload your brand logo
                </p>

                <p className="text-xs text-gray-500 mb-3">
                  Drag & drop, or click to browse your files
                </p>

                <p className="text-[10px] text-gray-400">
                  Supported formats: JPEG / JPG / WEBP — Max 1MB
                </p>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept=".jpeg,.jpg,.webp"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
        </div>
        {/* Buttons */}
        <div className="flex gap-3 items-center justify-end  w-80 ">
          <button className="font-semibold rounded-full text-red-700  p-2 w-32">
            Cancel
          </button>
          <button className="font-semibold bg-blue-500 text-white rounded-full p-2 w-32">
            Save
          </button>
        </div>
      </div>

      {/* Live Preview */}
      <div className="flex w-full rounded-lg overflow-hidden border shadow">
        <div className="w-1/3" style={{ background: selectedSidebar }}></div>
        <div className="w-2/3" style={{ background: selectedBackground }}></div>
      </div>
    </div>
  )
}

export default Customization
