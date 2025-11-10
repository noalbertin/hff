// frontend/src/store/auth.js
import { create } from 'zustand'
import { mountStoreDevtool } from 'simple-zustand-devtools'

const useAuthStore = create((set, get) => ({
  allUserData: null,
  loading: false,

  setUser: (user) => set({ allUserData: user }),
  setLoading: (loading) => set({ loading }),
}))

// Sélecteurs en dehors du store
export const selectUser = (state) => {
  const data = state.allUserData
  return {
    id_user: data?.id_user || null,
    nom_user: data?.nom_user || null,
    role: data?.role || null,
  }
}

export const selectIsLoggedIn = (state) => state.allUserData !== null

if (import.meta.env.DEV) {
  mountStoreDevtool('Store', useAuthStore)
}

export { useAuthStore }
