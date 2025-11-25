import { create } from "zustand"

const useGameStore = create((set) => ({
  games: [],
  loading: false,

  // Fetch all games (supports query filters)
  fetchGames: async (API_URL, query = {}) => {
    set({ loading: true })

    try {
      const params = new URLSearchParams(query).toString()
      const url = params ? `${API_URL}/games?${params}` : `${API_URL}/games`

      const res = await fetch(url)
      const data = await res.json()

      set({
        games: Array.isArray(data) ? data : data.games || [],
      })
    } catch (err) {
      console.error("Fetch games error:", err)
    } finally {
      set({ loading: false })
    }
  },

  // Create a new game
  addGame: async (API_URL, newGame) => {
    try {
      const res = await fetch(`${API_URL}/games`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newGame),
      })

      const data = await res.json()

      if (!res.ok) return data

      if (data.game) {
        set((state) => ({
          games: [data.game, ...state.games],
        }))
      }

      return data
    } catch (err) {
      return { message: "Failed to add game" }
    }
  },

  // Update a game
  updateGame: async (API_URL, id, updatedGame) => {
    try {
      const res = await fetch(`${API_URL}/games/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedGame),
      })

      const data = await res.json()

      if (!res.ok) return data

      if (data.game) {
        set((state) => ({
          games: state.games.map((g) => (g._id === id ? data.game : g)),
        }))
      }

      return data
    } catch (err) {
      return { message: "Failed to update game" }
    }
  },

  // Delete a game
  deleteGame: async (API_URL, id) => {
    try {
      const res = await fetch(`${API_URL}/games/${id}`, {
        method: "DELETE",
      })

      const data = await res.json()

      if (!res.ok) return data

      set((state) => ({
        games: state.games.filter((g) => g._id !== id),
      }))

      return data
    } catch (err) {
      return { message: "Failed to delete game" }
    }
  },

  // Bulk delete
  deleteManyGames: async (API_URL, ids) => {
    try {
      const res = await fetch(`${API_URL}/games/bulk-delete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      })

      const data = await res.json()

      if (data.message?.toLowerCase().includes("success")) {
        set((state) => ({
          games: state.games.filter((g) => !ids.includes(g._id)),
        }))
      }

      return data
    } catch (err) {
      return { message: "Failed to bulk delete games" }
    }
  },
  checkGameIdExists: async (API_URL, gameId) => {
    try {
      const res = await fetch(`${API_URL}/games/${gameId}`)
      const data = await res.json()
      return data // { exists: boolean, game?: {...} }
    } catch (err) {
      return { exists: false, message: "Check failed" }
    }
  },
  fetchBackendGames: async (API_URL, providerCode) => {
    try {
      const res = await fetch(`${API_URL}/games?provider=${providerCode}`)
      const backendGames = await res.json()
      return backendGames
    } catch {
      return []
    }
  },
}))

export default useGameStore
