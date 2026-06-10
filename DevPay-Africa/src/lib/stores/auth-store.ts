// src/lib/stores/auth-store.ts
import { create } from "zustand"
import { persist } from "zustand/middleware"

interface Profile {
  id: string
  role: "developer" | "client" | "admin"
  full_name: string
  username: string
  email: string
  avatar_url: string | null
  country: string | null
  is_verified: boolean
}

interface AuthStore {
  user: Profile | null
  isLoading: boolean
  isAuthenticated: boolean
  setUser: (user: Profile | null) => void
  setLoading: (loading: boolean) => void
  logout: () => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      isLoading: true,
      isAuthenticated: false,

      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user,
          isLoading: false,
        }),

      setLoading: (isLoading) => set({ isLoading }),

      logout: () =>
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        }),
    }),
    {
      name: "devpay-auth",
      partialize: (state) => ({ user: state.user }),
    }
  )
)
