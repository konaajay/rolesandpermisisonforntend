import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAppStore = create(
  persist(
    (set) => ({
      searchQuery: '',
      setSearchQuery: (query) => set({ searchQuery: query }),
      theme: 'dark',
      toggleTheme: () => set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),
      currentUser: null,
      userRole: null,
      setCurrentUser: (user, role = 'STAFF') => set({ currentUser: user, userRole: role }),
      logout: () => set({ currentUser: null, userRole: null }),
    }),
    {
      name: 'vendoros-storage',
    }
  )
);
