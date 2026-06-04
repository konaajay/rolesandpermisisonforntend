import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAppStore = create(
  persist(
    (set) => ({
      searchQuery: '',
      setSearchQuery: (query) => set({ searchQuery: query }),
      currentUser: null,
      userRole: null,
      theme: 'light',
      toggleTheme: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
      setCurrentUser: (user, role = 'STAFF') => set({ currentUser: user, userRole: role }),
      logout: () => set({ currentUser: null, userRole: null }),
    }),
    {
      name: 'vendoros-storage',
    }
  )
);
