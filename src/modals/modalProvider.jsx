import React, { useState, useRef, useEffect } from "react"
import { IoClose } from "react-icons/io5"
import { FiUploadCloud } from "react-icons/fi"
import { AnimatePresence, motion } from "framer-motion"
import useProviderStore from "../stores/providerStore"

const API_URL = process.env.REACT_APP_BACKEND_API

const ModalProvider = ({ isOpen, onClose, mode, data, onSuccess, refresh }) => {
  const { createProvider, updateProvider } = useProviderStore()

  const darkLogoRef = useRef(null)
  const lightLogoRef = useRef(null)
  const imageRef = useRef(null)

  const [providerId, setProviderId] = useState("")
  const [providerName, setProviderName] = useState("")
  const [directory, setDirectory] = useState("")
  const [providerOrder, setProviderOrder] = useState("")

  const [darkLogoFile, setDarkLogoFile] = useState(null)
  const [lightLogoFile, setLightLogoFile] = useState(null)
  const [imageFile, setImageFile] = useState(null)

  const [darkLogoPreview, setDarkLogoPreview] = useState(null)
  const [lightLogoPreview, setLightLogoPreview] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)

  const [darkLogoName, setDarkLogoName] = useState("")
  const [lightLogoName, setLightLogoName] = useState("")
  const [imageName, setImageName] = useState("")

  const [isNewGame, setIsNewGame] = useState(false)
  const [isTopGame, setIsTopGame] = useState(false)
  const [isHidden, setIsHidden] = useState(false)

  const [errorMessage, setErrorMessage] = useState("")
  const [loading, setLoading] = useState(false)

  // PREFILL
  useEffect(() => {
    if (isOpen && mode === "edit" && data) {
      setProviderId(data.provider_id || "")
      setProviderName(data.name || "")
      setDirectory(data.directory || "")
      setProviderOrder(data.order ?? "")

      setIsNewGame(data.newGame || false)
      setIsTopGame(data.topGame || false)
      setIsHidden(data.hidden || false)

      setDarkLogoPreview(data.darkLogo || "")
      setLightLogoPreview(data.lightLogo || "")
      setImagePreview(data.image || "")

      setDarkLogoName(data.darkLogo || "")
      setLightLogoName(data.lightLogo || "")
      setImageName(data.image || "")
    }

    if (isOpen && mode === "add") {
      resetForm()
    }
  }, [isOpen, mode, data])

  const resetForm = () => {
    setProviderId("")
    setProviderName("")
    setDirectory("")
    setProviderOrder("")
    setIsNewGame(false)
    setIsTopGame(false)
    setIsHidden(false)

    setDarkLogoFile(null)
    setLightLogoFile(null)
    setImageFile(null)

    setDarkLogoPreview(null)
    setLightLogoPreview(null)
    setImagePreview(null)

    setDarkLogoName("")
    setLightLogoName("")
    setImageName("")

    setErrorMessage("")
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const validateFile = (file) => {
    if (!file) return "Invalid file."
    const validTypes = ["image/jpeg", "image/webp"]
    if (!validTypes.includes(file.type)) return "Only JPEG & WEBP allowed"
    if (file.size > 1024 * 1024) return "File must be below 1MB"
    return null
  }

  const handleFileChange = (file, type) => {
    const error = validateFile(file)
    if (error) return setErrorMessage(error)

    const preview = URL.createObjectURL(file)

    if (type === "dark") {
      setDarkLogoFile(file)
      setDarkLogoPreview(preview)
      setDarkLogoName(file.name)
    }
    if (type === "light") {
      setLightLogoFile(file)
      setLightLogoPreview(preview)
      setLightLogoName(file.name)
    }
    if (type === "image") {
      setImageFile(file)
      setImagePreview(preview)
      setImageName(file.name)
    }

    setErrorMessage("")
  }

  // CLOUDINARY UPLOAD HANDLER
  const uploadToCloudinary = async (file) => {
    if (!file) return null
    const formData = new FormData()
    formData.append("file", file)
    formData.append("upload_preset", process.env.REACT_APP_CLOUDINARY_PRESET)

    const cloudName = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      { method: "POST", body: formData }
    )

    const data = await res.json()
    return data.secure_url || null
  }

  const handleUpload = async () => {
    if (!providerId.trim()) return setErrorMessage("Provider ID required")
    if (!providerName.trim()) return setErrorMessage("Provider name required")
    if (!directory.trim()) return setErrorMessage("Directory required")
    if (!imagePreview && !imageFile)
      return setErrorMessage("Main image is required")

    setLoading(true)

    try {
      let darkLogoUrl = darkLogoPreview
      let lightLogoUrl = lightLogoPreview
      let imageUrl = imagePreview

      // Upload files to cloudinary if changed
      if (darkLogoFile) darkLogoUrl = await uploadToCloudinary(darkLogoFile)
      if (lightLogoFile) lightLogoUrl = await uploadToCloudinary(lightLogoFile)
      if (imageFile) imageUrl = await uploadToCloudinary(imageFile)

      const payload = {
        provider_id: providerId,
        name: providerName,
        directory,
        order: Number(providerOrder) || -1,
        darkLogo: darkLogoUrl,
        lightLogo: lightLogoUrl,
        image: imageUrl,
        newGame: isNewGame,
        topGame: isTopGame,
        hidden: isHidden,
      }

      let res
      if (mode === "edit") {
        res = await updateProvider(API_URL, data._id, payload)
      } else {
        res = await createProvider(API_URL, payload)
      }

      if (!res || res.message?.includes("Failed"))
        throw new Error("Failed to save provider")

      handleClose()
      refresh?.()
      onSuccess?.("Provider saved successfully.")
    } catch (err) {
      setErrorMessage(err.message)
    } finally {
      setLoading(false)
    }
  }

  const dragProps = (type) => ({
    onDragOver: (e) => e.preventDefault(),
    onDrop: (e) => {
      e.preventDefault()
      handleFileChange(e.dataTransfer.files[0], type)
    },
  })

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <motion.div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          />

          {/* MODAL */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            transition={{ duration: 0.3 }}
            className="relative bg-white rounded-lg shadow-lg w-[400px] md:w-[50%] p-5 z-10 max-h-[90vh]"
          >
            {/* HEADER */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-[16px] font-semibold">
                {mode === "edit" ? "Edit Provider" : "Add Provider"}
              </h2>
              <button onClick={handleClose}>
                <IoClose size={22} />
              </button>
            </div>

            <div className="flex flex-col w-full gap-4">
              {/* Group Input */}
              <div className="flex w-full gap-2">
                <div className="flex flex-col w-full gap-2">
                  {/* PROVIDER ID */}
                  <div className="flex flex-col gap-2">
                    <label className="block text-sm font-medium">
                      Provider ID
                    </label>
                    <input
                      type="text"
                      className="w-full border rounded px-3 py-2"
                      placeholder="ex: jili, spadegaming"
                      value={providerId}
                      onChange={(e) => setProviderId(e.target.value)}
                    />
                  </div>

                  {/* PROVIDER NAME */}
                  <div className="flex flex-col gap-2">
                    <label className="block text-sm font-medium">
                      Provider Name
                    </label>
                    <input
                      type="text"
                      className="w-full border rounded px-3 py-2 "
                      placeholder="Enter provider name"
                      value={providerName}
                      onChange={(e) => setProviderName(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex flex-col w-full gap-2">
                  {/* DIRECTORY - NEW FIELD */}
                  <div className="flex flex-col gap-2">
                    <label className="block text-sm font-medium">
                      Directory
                    </label>
                    <input
                      type="text"
                      className="w-full border rounded px-3 py-2 "
                      placeholder="/slots/jili/"
                      value={directory}
                      onChange={(e) => setDirectory(e.target.value)}
                    />
                  </div>

                  {/* ORDER */}
                  <div className="flex flex-col gap-2">
                    <label className="block text-sm font-medium">Order</label>
                    <input
                      type="number"
                      className="w-full border rounded px-3 py-2 "
                      placeholder="0"
                      value={providerOrder}
                      onChange={(e) => setProviderOrder(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Group Images */}
              <div className="flex w-full gap-2">
                {/* DARK LOGO */}
                <div
                  {...dragProps("dark")}
                  onClick={() => darkLogoRef.current.click()}
                  className="border-2 w-full border-dashed rounded-md h-[220px] p-4 cursor-pointer hover:border-blue-400 flex flex-col text-center"
                >
                  <h1 className="font-semibold text-lg text-gray-500 mb-2">
                    Dark Mode Image
                  </h1>

                  {darkLogoPreview ? (
                    <div className="relative w-full h-full flex items-center justify-center">
                      <img
                        src={darkLogoPreview}
                        className="w-full h-full object-contain rounded"
                      />

                      {/* FIXED TOP RIGHT CLOSE BUTTON */}
                      <button
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full shadow-md"
                        onClick={(e) => {
                          e.stopPropagation()
                          setDarkLogoFile(null)
                          setDarkLogoPreview(null)
                          darkLogoRef.current.value = ""
                        }}
                      >
                        <IoClose size={16} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full">
                      <FiUploadCloud className="text-3xl text-gray-400 mb-2" />
                      <p className="text-gray-600 text-sm">
                        Drop image or click
                      </p>
                      <p className="text-gray-400 text-xs mt-1">
                        JPEG / WEBP — Max 1MB
                      </p>
                    </div>
                  )}

                  <input
                    ref={darkLogoRef}
                    type="file"
                    accept=".jpeg,.jpg,.webp"
                    className="hidden"
                    onChange={(e) =>
                      handleFileChange(e.target.files[0], "dark")
                    }
                  />
                </div>

                {/* LIGHT LOGO */}
                <div
                  {...dragProps("light")}
                  onClick={() => lightLogoRef.current.click()}
                  className="bg-gray-700 border-2 w-full border-dashed rounded-md h-[220px] p-4 cursor-pointer hover:border-blue-400 flex flex-col text-center"
                >
                  <h1 className="font-semibold text-lg text-gray-400 mb-2">
                    Light Mode Image
                  </h1>

                  {lightLogoPreview ? (
                    <div className="relative w-full h-full flex items-center justify-center">
                      <img
                        src={lightLogoPreview}
                        className="w-full h-full object-contain rounded"
                      />

                      {/* FIXED TOP RIGHT CLOSE BUTTON */}
                      <button
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full shadow-md"
                        onClick={(e) => {
                          e.stopPropagation()
                          setLightLogoFile(null)
                          setLightLogoPreview(null)
                          lightLogoRef.current.value = ""
                        }}
                      >
                        <IoClose size={16} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full">
                      <FiUploadCloud className="text-3xl text-gray-400 mb-2" />
                      <p className="text-gray-400 text-sm">
                        Drop image or click
                      </p>
                      <p className="text-gray-400 text-xs mt-1">
                        JPEG / WEBP — Max 1MB
                      </p>
                    </div>
                  )}

                  <input
                    ref={lightLogoRef}
                    type="file"
                    accept=".jpeg,.jpg,.webp"
                    className="hidden"
                    onChange={(e) =>
                      handleFileChange(e.target.files[0], "light")
                    }
                  />
                </div>

                {/* MAIN IMAGE */}
                <div
                  {...dragProps("image")}
                  onClick={() => imageRef.current.click()}
                  className="border-2 w-full border-dashed rounded-md h-[220px] p-4 cursor-pointer hover:border-blue-400 flex flex-col text-center"
                >
                  <h1 className="font-semibold text-lg text-gray-500 mb-2">
                    Image
                  </h1>

                  {imagePreview ? (
                    <div className="relative w-full h-full flex items-center justify-center">
                      <img
                        src={imagePreview}
                        className="w-full h-full object-contain rounded"
                      />

                      {/* FIXED TOP RIGHT CLOSE BUTTON */}
                      <button
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full shadow-md"
                        onClick={(e) => {
                          e.stopPropagation()
                          setImageFile(null)
                          setImagePreview(null)
                          imageRef.current.value = ""
                        }}
                      >
                        <IoClose size={16} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full">
                      <FiUploadCloud className="text-3xl text-gray-400 mb-2" />
                      <p className="text-gray-600 text-sm">
                        Drop image or click
                      </p>
                      <p className="text-gray-400 text-xs mt-1">
                        JPEG / WEBP — Max 1MB
                      </p>
                    </div>
                  )}

                  <input
                    ref={imageRef}
                    type="file"
                    accept=".jpeg,.jpg,.webp"
                    className="hidden"
                    onChange={(e) =>
                      handleFileChange(e.target.files[0], "image")
                    }
                  />
                </div>
              </div>

              {/* TOGGLES */}
              <div className="flex items-center gap-3 mb-2 w-full">
                <div>
                  <input
                    type="checkbox"
                    id="newgame"
                    checked={isNewGame}
                    onChange={(e) => setIsNewGame(e.target.checked)}
                    className="hidden"
                  />
                  <label
                    htmlFor="newgame"
                    className={`rounded-full px-3 py-1 text-xs font-semibold cursor-pointer transition-all
                    ${
                      isNewGame
                        ? "bg-green-500 text-white shadow-sm"
                        : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    New Game
                  </label>
                </div>

                <div>
                  <input
                    type="checkbox"
                    id="topgame"
                    checked={isTopGame}
                    onChange={(e) => setIsTopGame(e.target.checked)}
                    className="hidden"
                  />
                  <label
                    htmlFor="topgame"
                    className={`rounded-full px-3 py-1 text-xs font-semibold cursor-pointer transition-all
                    ${
                      isTopGame
                        ? "bg-blue-500 text-white shadow-sm"
                        : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    Top Game
                  </label>
                </div>

                <div>
                  <input
                    type="checkbox"
                    id="hidden"
                    checked={isHidden}
                    onChange={(e) => setIsHidden(e.target.checked)}
                    className="hidden"
                  />
                  <label
                    htmlFor="hidden"
                    className={`rounded-full px-3 py-1 text-xs font-semibold cursor-pointer transition-all
                    ${
                      isHidden
                        ? "bg-red-500 text-white shadow-sm"
                        : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    Hidden
                  </label>
                </div>
              </div>
            </div>

            {errorMessage && (
              <p className="text-red-500 text-sm mt-3">{errorMessage}</p>
            )}

            <button
              disabled={loading}
              onClick={handleUpload}
              className={`mt-4 w-full py-2 rounded-md text-white font-medium ${
                loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {loading ? "Saving..." : mode === "edit" ? "Update" : "Upload"}
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

export default ModalProvider
