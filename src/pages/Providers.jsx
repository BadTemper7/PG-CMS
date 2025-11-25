import React, { useState, useMemo, useEffect } from "react"
import { MdDelete, MdEditSquare } from "react-icons/md"
import CardDelete from "../cards/cardDelete"
import CardSuccess from "../cards/cardSuccess"
import CountCards from "../cards/countCards"
import ModalProvider from "../modals/modalProvider"
import useProviderStore from "../stores/providerStore"
import useGameStore from "../stores/gameStore"
import ProviderCountCards from "../cards/providercountCards"
import { motion, AnimatePresence } from "framer-motion"
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"
import { CgGames } from "react-icons/cg"
import { FiSearch } from "react-icons/fi"
import { IoMdClose } from "react-icons/io"
import { FaStar } from "react-icons/fa"
import { FaFire } from "react-icons/fa"

const API_URL = process.env.REACT_APP_BACKEND_API
const apiJSONURL = process.env.REACT_APP_API_JSON
// const API_URL = "http://localhost:5000/api"

const Providers = () => {
  const {
    providers,
    getSlotsProviderList,
    deleteProvider,
    deleteManyProviders,
    updateProviderNewGame,
    updateProviderTopGame,
    updateProviderHidden,
    reorderProviders,
  } = useProviderStore()
  const { checkGameIdExists, addGame, updateGame, fetchBackendGames } =
    useGameStore()
  const [games, setGames] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const defaultPageSize = 5
  const [pageSize, setPageSize] = useState(defaultPageSize)
  const [mode, setMode] = useState("add")
  const isMobile = window.innerWidth <= 840

  const [selectedProvider, setSelectedProvider] = useState(null)
  const [selectedIds, setSelectedIds] = useState(new Set())

  const [showBulkDelete, setShowBulkDelete] = useState(false)
  const [deleteId, setDeleteId] = useState(null)
  const [showDelete, setShowDelete] = useState(false)

  const [showSuccess, setShowSuccess] = useState(false)
  const [successData, setSuccessData] = useState({
    title: "",
    description: "",
  })
  const [filterStatus, setFilterStatus] = useState("all")
  const total = providers.length
  const newCount = providers.filter((p) => p.newGame).length
  const topCount = providers.filter((p) => p.topGame).length
  const hiddenCount = providers.filter((p) => p.hidden).length
  const [editingId, setEditingId] = useState(null)
  const [editingField, setEditingField] = useState(null)
  const [dropdownPos, setDropdownPos] = useState({ x: 0, y: 0 })
  const [showGamesModal, setShowGamesModal] = useState(false)
  const [loadingGames, setLoadingGames] = useState(false)
  const [gamesProviderName, setGamesProviderName] = useState("")

  const [filtered, setFiltered] = useState([])

  const [previewImg, setPreviewImg] = useState(null)
  const [showPreview, setShowPreview] = useState(false)
  const [gameSearchTerm, setGameSearchTerm] = useState("")
  // 🔥 ADD THIS MISSING SEARCH STATE
  const [searchTerm, setSearchTerm] = useState("")
  const [gameStatus, setGameStatus] = useState({})
  const sortGames = (games) => {
    const getPriority = (tab = "") => {
      tab = tab.toLowerCase()

      if (tab.includes("top") && tab.includes("hot") && tab.includes("new"))
        return 1
      if (tab.includes("top") && tab.includes("hot")) return 2
      if (tab.includes("top") && tab.includes("new")) return 3
      if (tab.includes("hot") && tab.includes("new")) return 4
      if (tab.includes("top")) return 5
      if (tab.includes("hot")) return 6
      if (tab.includes("new")) return 7

      return 8
    }

    return [...games].sort(
      (a, b) => getPriority(a.gameTab) - getPriority(b.gameTab)
    )
  }

  const toggleGameFlag = async (gameId, field, gameData) => {
    const res = await checkGameIdExists(API_URL, gameId)

    let currentTab = res.exists
      ? res.game.gameTab || ""
      : gameData.gameTab || ""
    let newTab = currentTab

    if (currentTab.includes(field)) {
      newTab = currentTab.replace(field, "")
    } else {
      newTab = currentTab + field
    }

    if (res.exists) {
      await updateGame(API_URL, res.game._id, { gameTab: newTab })
    } else {
      await addGame(API_URL, {
        gameId: gameData.gameId,
        gameName: gameData.gameName,
        gameImg: gameData.gameImg,
        gameDemo: gameData.gameDemo,
        gameCategory: gameData.gameCategory,
        gameProvider: gameData.gameProvider,
        gameTab: newTab,
      })
    }

    // 🟡 Real-time update + re-sort
    setGames((prev) =>
      sortGames(
        prev.map((g) => (g.gameId === gameId ? { ...g, gameTab: newTab } : g))
      )
    )

    // Update icons
    setGameStatus((prev) => ({
      ...prev,
      [gameId]: {
        ...prev[gameId],
        [field]: newTab.includes(field),
      },
    }))
  }

  const filteredGames = useMemo(() => {
    if (!gameSearchTerm.trim()) return games
    const term = gameSearchTerm.toLowerCase()
    return games.filter((g) => g.gameName.toLowerCase().includes(term))
  }, [games, gameSearchTerm])

  useEffect(() => {
    let data = [...providers]

    // APPLY STATUS FILTER
    if (filterStatus === "new") {
      data = data.filter((p) => p.newGame)
    } else if (filterStatus === "top") {
      data = data.filter((p) => p.topGame)
    } else if (filterStatus === "hidden") {
      data = data.filter((p) => p.hidden)
    }

    // APPLY SEARCH
    if (searchTerm.trim() !== "") {
      const term = searchTerm.toLowerCase()
      data = data.filter(
        (p) =>
          p.name.toLowerCase().includes(term) ||
          p.directory.toLowerCase().includes(term)
      )
    }

    setFiltered(data)
    setCurrentPage(1)
  }, [providers, filterStatus, searchTerm])

  const handleFilter = (type) => {
    setFilterStatus(type)

    if (type === "all") {
      setFiltered(providers)
    } else if (type === "new") {
      setFiltered(providers.filter((p) => p.newGame))
    } else if (type === "top") {
      setFiltered(providers.filter((p) => p.topGame))
    } else if (type === "hidden") {
      setFiltered(providers.filter((p) => p.hidden))
    }

    setCurrentPage(1)
  }
  const reorderList = (list, startIndex, endIndex) => {
    const result = Array.from(list)
    const [removed] = result.splice(startIndex, 1)
    result.splice(endIndex, 0, removed)
    return result
  }

  const onDragEnd = async (result) => {
    if (!result.destination) return

    const newOrder = reorderList(
      filtered,
      result.source.index,
      result.destination.index
    )
    setFiltered(newOrder)

    const orderedIds = newOrder.map((p) => p._id)
    console.log(orderedIds)
    await reorderProviders(API_URL, orderedIds)
  }

  // ============================
  //   LOAD PROVIDERS FROM API
  // ============================
  useEffect(() => {
    getSlotsProviderList(API_URL)
  }, [getSlotsProviderList])
  // ============================
  //   PAGINATION
  // ============================
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filtered.slice(start, start + pageSize)
  }, [filtered, currentPage, pageSize])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))

  const handlePageChange = (p) => {
    if (p >= 1 && p <= totalPages) setCurrentPage(p)
  }
  const providerList = [
    {
      FiveGames: "5G",
      Spadegaming: "spade",
      JILI: "jili",
      Bigpot: "bigpot",
      "No Limit City": "evonlc",
      Yggdrasil: "yggdrasil",
      Wazdan: "wazdan",
      "Triple Profits Gaming": "tpg",
      "Real Time Gaming": "rtg",
      "Red Tiger": "evoredtiger",
      Playstar: "playstar",
      "PG Soft": "pgsoft",
      Nextspin: "nextspin",
      NetEnt: "netent",
      JDB: "jdb",
      "FA Chai": "fachaidirect",
      CQ9: "cq9",
      "Big Time Gaming": "btg",
      Booongo: "booongo",
      "Pragmatic Play": "pp",
      Habanero: "habanero",
      Elbet: "elbet",
      Playtech: "playtechsw",
    },
  ]
  async function getProviderGames(providerName) {
    try {
      setLoadingGames(true)
      const domain = isMobile ? "&m=1" : ""
      const providerCode = providerList[0][providerName] // <-- USE PROVIDER CODE

      const payload = `cmd=getGame&p=${providerCode}${domain}&domain=sg8`

      // 1. FETCH JSON GAME LIST
      const response = await fetch(apiJSONURL, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: payload,
      })

      if (!response.ok) throw new Error("Network response was not ok")

      const jsonData = await response.json()

      const loadedGames = Object.values(jsonData).map((data) => ({
        gameId: data[0],
        gameName: data[1],
        gameImg: data[2],
        gameDemo: data[3],
        gameCategory: data[4],
        gameTab: data[5] || "",
        gameProvider: providerName,
      }))

      // 2. FETCH BACKEND GAMES FOR THIS PROVIDER
      const backendGames = await fetchBackendGames(API_URL, providerName)

      // 3. BUILD LOOKUP MAP
      const backendMap = {}
      backendGames.forEach((g) => {
        backendMap[g.gameId] = g.gameTab
      })

      // 4. MERGE backend gameTab with JSON API results
      const mergedGames = loadedGames.map((g) => ({
        ...g,
        gameTab: backendMap[g.gameId] ?? g.gameTab,
      }))

      // 5. SORT MERGED GAMES
      const sortedGames = mergedGames.sort((a, b) => {
        const getPriority = (game) => {
          const tab = game.gameTab?.toLowerCase() || ""

          if (tab.includes("top") && tab.includes("hot") && tab.includes("new"))
            return 1
          if (tab.includes("top") && tab.includes("hot")) return 2
          if (tab.includes("top") && tab.includes("new")) return 3
          if (tab.includes("hot") && tab.includes("new")) return 4
          if (tab.includes("top")) return 5
          if (tab.includes("hot")) return 6
          if (tab.includes("new")) return 7

          return 8
        }

        return getPriority(a) - getPriority(b)
      })

      // 6. SET UI STATES
      setGamesProviderName(providerName)
      setGames(sortedGames)
      setShowGamesModal(true)
      setLoadingGames(false)
    } catch (error) {
      console.error("Failed to fetch games:", error)
    }
  }

  // function setTopGames() {
  //   const sample = "asdf"
  //   console.log(sample)
  // }
  // useEffect(() => {
  //   const fetchGames = async () => {
  //     try {
  //       const domain = ""
  //       const response = await axios.post(
  //         apiJSONURL,
  //         `cmd=getGame&p=${provider}${domain}&domain=sg8`,
  //         {
  //           headers: {
  //             "Content-Type": "application/x-www-form-urlencoded",
  //           },
  //         }
  //       )
  //       const jsonData = response.data
  //       const loadedGames = Object.values(jsonData).map((data) => ({
  //         gameId: data[0],
  //         gameName: data[1],
  //         gameImg: data[2],
  //         gameDemo: data[3],
  //         gameCategory: data[4],
  //         gameTab: data[5],
  //       }))
  //       setGames(loadedGames)
  //       setLoading(false)
  //     } catch (error) {
  //       console.error("Failed to fetch games:", error)
  //       setLoading(false)
  //     }
  //   }

  //   fetchGames()
  // }, [provider, isMobile])
  // ============================
  //   SELECT (single / many)
  // ============================
  const toggleSelectOne = (id) => {
    const newSet = new Set(selectedIds)
    newSet.has(id) ? newSet.delete(id) : newSet.add(id)
    setSelectedIds(newSet)
  }

  const toggleSelectAll = () => {
    const idsInFilter = filtered.map((p) => p._id) // ALL filtered items
    const idsInPage = paginated.map((p) => p._id) // Only current page

    const allFilteredSelected = idsInFilter.every((id) => selectedIds.has(id))

    const newSet = new Set(selectedIds)

    if (allFilteredSelected) {
      // Unselect ALL in filter
      idsInFilter.forEach((id) => newSet.delete(id))
    } else {
      // Select ALL in filter
      idsInFilter.forEach((id) => newSet.add(id))
    }

    setSelectedIds(newSet)
  }

  const getBreadcrumb = () => {
    const map = {
      all: "All",
      new: "New",
      top: "Top",
      hidden: "Hidden",
    }
    return map[filterStatus] || "All"
  }

  // ============================
  // DELETE: SINGLE
  // ============================
  const confirmDelete = async () => {
    const res = await deleteProvider(API_URL, deleteId)

    setShowSuccess(true)
    setSuccessData({
      title: "Deleted!",
      description: res.message || "Provider removed.",
    })

    setShowDelete(false)
  }

  // ============================
  // DELETE: BULK
  // ============================
  const confirmBulkDelete = async () => {
    const ids = Array.from(selectedIds)
    const res = await deleteManyProviders(API_URL, ids)

    setSelectedIds(new Set())
    setShowBulkDelete(false)

    setSuccessData({
      title: "Deleted!",
      description: res.message,
    })
    setShowSuccess(true)
  }

  // ============================
  // INLINE UPDATE DROPDOWN
  // ============================
  const optionSets = {
    newGame: [
      { label: "Yes", value: true },
      { label: "No", value: false },
    ],
    topGame: [
      { label: "Yes", value: true },
      { label: "No", value: false },
    ],
    hidden: [
      { label: "Yes", value: true },
      { label: "No", value: false },
    ],
  }

  const openDropdown = (e, id, field) => {
    e.stopPropagation()
    const rect = e.target.getBoundingClientRect()

    setDropdownPos({ x: rect.left + rect.width / 2, y: rect.bottom + 6 })
    setEditingId(id)
    setEditingField(field)
  }

  const updateField = async (id, field, value) => {
    if (field === "newGame") await updateProviderNewGame(API_URL, id, value)
    if (field === "topGame") await updateProviderTopGame(API_URL, id, value)
    if (field === "hidden") await updateProviderHidden(API_URL, id, value)

    setEditingId(null)
    setEditingField(null)

    setSuccessData({ title: "Updated!", description: `${field} updated.` })
    setShowSuccess(true)
  }

  useEffect(() => {
    const close = () => {
      setEditingId(null)
      setEditingField(null)
    }
    document.addEventListener("click", close)
    return () => document.removeEventListener("click", close)
  }, [])

  return (
    <div className="w-full">
      <div className="flex items-center gap-2 mb-2">
        <h2 className="text-lg font-bold">Providers</h2>
        <span className="text-gray-500 text-sm">&gt; {getBreadcrumb()}</span>
      </div>

      <ProviderCountCards
        total={total}
        newCount={newCount}
        topCount={topCount}
        hiddenCount={hiddenCount}
        onFilter={handleFilter}
      />

      {/* ACTIONS BAR */}
      <div className="flex justify-between gap-4 mb-4">
        {/* SEARCH BAR */}
        <div className="flex mb-3">
          <input
            type="text"
            placeholder="Search name or directory..."
            className="border px-3 py-2 rounded w-64 shadow-sm"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setCurrentPage(1)
            }}
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <label className="text-sm">Rows per page:</label>
            <input
              type="number"
              min={1}
              placeholder="5"
              className="border rounded px-2 py-1 w-20"
              value={pageSize === defaultPageSize ? "" : pageSize}
              onChange={(e) => {
                const v = Number(e.target.value)
                setPageSize(v || defaultPageSize)
                setCurrentPage(1)
              }}
            />
          </div>

          {selectedIds.size > 0 && (
            <button
              onClick={() => setShowBulkDelete(true)}
              className="bg-red-600 text-white px-4 py-2 rounded"
            >
              Delete Selected ({selectedIds.size})
            </button>
          )}

          <button
            onClick={() => {
              setMode("add")
              setSelectedProvider(null)
              setShowModal(true)
            }}
            className="font-semibold text-white bg-blue-600 py-2 px-6 rounded hover:scale-105 transition"
          >
            Upload
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div className="border rounded shadow-sm overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">
                <input
                  type="checkbox"
                  checked={
                    filtered.length > 0 &&
                    filtered.every((p) => selectedIds.has(p._id))
                  }
                  onChange={toggleSelectAll}
                />
              </th>

              <th className="p-3 text-center">Order</th>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-center">Dark Logo</th>
              <th className="p-3 text-center">Light Logo</th>
              <th className="p-3 text-center">Image</th>
              <th className="p-3 text-center">New</th>
              <th className="p-3 text-center">Top</th>
              <th className="p-3 text-center">Hidden</th>
              <th className="p-3 text-left">Directory</th>
              <th className="p-3 text-center">Actions</th>
            </tr>
          </thead>

          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="providers-droppable">
              {(provided) => (
                <tbody ref={provided.innerRef} {...provided.droppableProps}>
                  {/* No Data */}
                  {paginated.length === 0 ? (
                    <tr>
                      <td
                        colSpan="11"
                        className="text-center p-6 text-gray-500"
                      >
                        No provider is available
                      </td>
                    </tr>
                  ) : (
                    paginated.map((item, index) => (
                      <Draggable
                        key={item._id}
                        draggableId={item._id}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <tr
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`border-b hover:bg-gray-50 transition ${
                              snapshot.isDragging ? "bg-blue-50 shadow-lg" : ""
                            }`}
                          >
                            <td className="p-3">
                              <input
                                type="checkbox"
                                checked={selectedIds.has(item._id)}
                                onChange={() => toggleSelectOne(item._id)}
                              />
                            </td>

                            <td className="p-3 text-center">
                              {item.order + 1}
                            </td>
                            <td className="p-3">{item.name}</td>

                            {/* DARK LOGO */}
                            <td className="p-3">
                              {item.darkLogo ? (
                                <img
                                  src={item.darkLogo}
                                  className="h-10 w-auto max-w-[80px] object-contain cursor-pointer hover:scale-105 transition mx-auto"
                                  onClick={() => {
                                    setPreviewImg(item.darkLogo)
                                    setShowPreview(true)
                                  }}
                                />
                              ) : (
                                <div className="text-gray-400 text-center">
                                  N/A
                                </div>
                              )}
                            </td>

                            {/* LIGHT LOGO */}
                            <td className="p-3">
                              {item.lightLogo ? (
                                <img
                                  src={item.lightLogo}
                                  className=" bg-gray-800 h-10 w-auto max-w-[80px] object-contain cursor-pointer hover:scale-105 transition mx-auto"
                                  onClick={() => {
                                    setPreviewImg(item.lightLogo)
                                    setShowPreview(true)
                                  }}
                                />
                              ) : (
                                <div className="text-gray-400 text-center">
                                  N/A
                                </div>
                              )}
                            </td>

                            {/* IMAGE */}
                            <td className="p-3">
                              {item.image ? (
                                <img
                                  src={item.image}
                                  className="h-14 w-auto max-w-[100px] object-contain cursor-pointer hover:scale-105 transition mx-auto"
                                  onClick={() => {
                                    setPreviewImg(item.image)
                                    setShowPreview(true)
                                  }}
                                />
                              ) : (
                                <div className="text-gray-400 text-center">
                                  N/A
                                </div>
                              )}
                            </td>

                            {/* NEW */}
                            <td className="p-3 text-center">
                              <span
                                className="px-3 py-1 rounded border cursor-pointer inline-flex gap-2 items-center"
                                onClick={(e) =>
                                  openDropdown(e, item._id, "newGame")
                                }
                              >
                                <span
                                  className={`w-2 h-2 rounded-full ${
                                    item.newGame
                                      ? "bg-green-500"
                                      : "bg-gray-500"
                                  }`}
                                ></span>
                                {item.newGame ? "Yes" : "No"}
                              </span>
                            </td>

                            {/* TOP */}
                            <td className="p-3 text-center">
                              <span
                                className="px-3 py-1 rounded border cursor-pointer inline-flex gap-2 items-center"
                                onClick={(e) =>
                                  openDropdown(e, item._id, "topGame")
                                }
                              >
                                <span
                                  className={`w-2 h-2 rounded-full ${
                                    item.topGame
                                      ? "bg-green-500"
                                      : "bg-gray-500"
                                  }`}
                                ></span>
                                {item.topGame ? "Yes" : "No"}
                              </span>
                            </td>

                            {/* HIDDEN */}
                            <td className="p-3 text-center">
                              <span
                                className="px-3 py-1 rounded border cursor-pointer inline-flex gap-2 items-center"
                                onClick={(e) =>
                                  openDropdown(e, item._id, "hidden")
                                }
                              >
                                <span
                                  className={`w-2 h-2 rounded-full ${
                                    item.hidden ? "bg-green-500" : "bg-gray-500"
                                  }`}
                                ></span>
                                {item.hidden ? "Yes" : "No"}
                              </span>
                            </td>

                            <td className="p-3 text-left">{item.directory}</td>

                            {/* ACTIONS */}
                            <td className="p-3 text-center">
                              <div className="flex justify-center gap-2">
                                <button
                                  className="p-2 bg-blue-500 text-white rounded hover:scale-110 transition"
                                  onClick={() => {
                                    setMode("edit")
                                    setSelectedProvider(item)
                                    setShowModal(true)
                                  }}
                                >
                                  <MdEditSquare />
                                </button>

                                <button
                                  className="p-2 bg-red-500 text-white rounded hover:scale-110 transition"
                                  onClick={() => {
                                    setDeleteId(item._id)
                                    setShowDelete(true)
                                  }}
                                >
                                  <MdDelete />
                                </button>

                                <button
                                  className="relative group p-2 bg-violet-500 text-white rounded hover:scale-110 transition"
                                  onClick={() => getProviderGames(item.name)}
                                >
                                  <CgGames />

                                  {/* Tooltip */}
                                  <span className="absolute left-1/2 -translate-x-1/2 -top-10 px-3 py-1 rounded-md text-xs font-medium bg-black text-white opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none z-50">
                                    Games
                                  </span>

                                  <span className="absolute left-1/2 -translate-x-1/2 -top-3 w-0 h-0 border-l-6 border-r-6 border-b-6 border-transparent border-b-black opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none z-50"></span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        )}
                      </Draggable>
                    ))
                  )}
                  {provided.placeholder}
                </tbody>
              )}
            </Droppable>
          </DragDropContext>
        </table>
      </div>

      {/* PAGINATION */}
      <div className="flex justify-end mt-5 mb-3">
        <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-md shadow-sm border text-sm">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1 rounded text-blue-600 disabled:text-gray-400"
          >
            Prev
          </button>

          {(() => {
            const pages = []

            if (currentPage > 2) {
              pages.push(1)
              if (currentPage > 3) pages.push("...")
            }

            const start = Math.max(1, currentPage - 1)
            const end = Math.min(totalPages, currentPage + 1)

            for (let i = start; i <= end; i++) {
              pages.push(i)
            }

            if (currentPage < totalPages - 2) {
              pages.push("...")
              pages.push(totalPages)
            }

            return pages.map((p, i) =>
              p === "..." ? (
                <span key={"dots-" + i} className="px-2 text-gray-500">
                  ...
                </span>
              ) : (
                <button
                  key={p}
                  onClick={() => handlePageChange(p)}
                  className={`w-8 h-8 flex items-center justify-center rounded ${
                    currentPage === p
                      ? "bg-blue-600 text-white"
                      : "text-gray-600 hover:bg-blue-50"
                  }`}
                >
                  {p}
                </button>
              )
            )
          })()}

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-1 rounded text-blue-600 disabled:text-gray-400"
          >
            Next
          </button>
        </div>
      </div>

      {/* BULK DELETE */}
      {showBulkDelete && (
        <CardDelete
          message="Delete selected providers?"
          onCancel={() => setShowBulkDelete(false)}
          onConfirm={confirmBulkDelete}
        />
      )}

      {/* SINGLE DELETE */}
      {showDelete && (
        <CardDelete
          message="Delete this provider?"
          onCancel={() => setShowDelete(false)}
          onConfirm={confirmDelete}
        />
      )}

      {/* SUCCESS */}
      {showSuccess && (
        <CardSuccess
          title={successData.title}
          description={successData.description}
          onClose={() => setShowSuccess(false)}
        />
      )}

      {/* DROPDOWN */}
      {editingId && editingField && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="fixed z-50 bg-white border rounded-lg shadow-xl py-2 w-40 animate-dropdown"
          style={{
            top: dropdownPos.y,
            left: dropdownPos.x,
            transform: "translateX(-50%)",
          }}
        >
          {optionSets[editingField].map((opt) => (
            <button
              key={opt.label}
              onClick={() => updateField(editingId, editingField, opt.value)}
              className="w-full px-3 py-2 text-left hover:bg-gray-100 flex items-center gap-2"
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  opt.value ? "bg-green-500" : "bg-gray-500"
                }`}
              ></span>
              {opt.label}
            </button>
          ))}
        </div>
      )}

      {/* MODAL */}
      <ModalProvider
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        mode={mode}
        data={selectedProvider}
        onSuccess={(msg) => {
          setShowSuccess(true)
          setSuccessData({
            title: "Success",
            description: msg,
          })
        }}
        refresh={() => getSlotsProviderList(API_URL)}
      />
      {/* IMAGE PREVIEW */}
      <AnimatePresence>
        {showPreview && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center z-[9999]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="absolute inset-0 bg-black/50 backdrop-blur-md"
              onClick={() => setShowPreview(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            <motion.img
              src={previewImg}
              className="max-w-[90%] max-h-[90%] object-contain rounded-lg relative z-10"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Show Games */}
      <AnimatePresence>
        {showGamesModal && (
          <motion.div
            className="fixed inset-0 z-[9999] flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowGamesModal(false)}
            />

            {/* Modal */}
            <motion.div
              className="relative bg-white rounded-lg shadow-xl w-[90%] max-w-5xl max-h-[85vh] overflow-y-auto p-6 z-50"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-bold mb-4">
                Games — {gamesProviderName}
              </h2>

              {/* SEARCH BAR */}
              <div className="relative w-full max-w-sm mb-4">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-lg" />

                <input
                  type="text"
                  placeholder="Search"
                  className="w-full border rounded-full py-2 pl-10 pr-10 bg-gray-100 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                  value={gameSearchTerm}
                  onChange={(e) => setGameSearchTerm(e.target.value)}
                />

                {gameSearchTerm && (
                  <IoMdClose
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 cursor-pointer text-xl"
                    onClick={() => setGameSearchTerm("")}
                  />
                )}
              </div>

              {/* Games Grid or Empty */}
              {filteredGames.length === 0 ? (
                <div className="text-center text-gray-500 py-10 text-lg">
                  No games found.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {filteredGames.map((g) => (
                    <div
                      key={g.gameId}
                      className="relative border rounded-lg p-3 shadow hover:shadow-lg transition"
                    >
                      {/* Top-right icons */}
                      <div className="absolute top-2 right-1 flex flex-col gap-2">
                        {/* ⭐ Top */}
                        <button
                        // onClick={() => {
                        //   setTopGames
                        // }}
                        >
                          <FaStar
                            className={`cursor-pointer text-lg transition ${
                              gameStatus[g.gameId]?.top ||
                              g.gameTab.includes("top")
                                ? "text-yellow-500"
                                : "text-gray-300"
                            }`}
                            onClick={() => toggleGameFlag(g.gameId, "top", g)}
                          />
                        </button>

                        {/* 🔥 Hot */}
                        <button>
                          <FaFire
                            className={`cursor-pointer text-lg transition ${
                              gameStatus[g.gameId]?.hot ||
                              g.gameTab.includes("hot")
                                ? "text-red-500"
                                : "text-gray-300"
                            }`}
                            onClick={() => toggleGameFlag(g.gameId, "hot", g)}
                          />
                        </button>
                      </div>

                      {/* Image */}
                      <img
                        src={g.gameImg}
                        alt={g.gameName}
                        className="w-full h-32 object-contain mb-2 rounded"
                      />

                      {/* Name */}
                      <p className="text-sm font-semibold text-center">
                        {g.gameName}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Preloader */}
      <AnimatePresence>
        {loadingGames && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Backdrop (Blur + Fade) */}
            <motion.div
              className="absolute inset-0 bg-black/50 backdrop-blur-md"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            {/* Pulsing Dots Loader */}
            <div className="relative z-10 flex items-center gap-2">
              <div className="w-4 h-4 bg-white rounded-full animate-bounce"></div>
              <div className="w-4 h-4 bg-white rounded-full animate-bounce [animation-delay:0.2s]"></div>
              <div className="w-4 h-4 bg-white rounded-full animate-bounce [animation-delay:0.4s]"></div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Providers
