import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface GlobalState {
  theme: 'light' | 'dark';
  language: string;
  notifications: Notification[];
  setTheme: (theme: 'light' | 'dark') => void;
  setLanguage: (lang: string) => void;
  addNotification: (notification: Notification) => void;
  removeNotification: (id: string) => void;
}

interface Notification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

const useGlobalStore = create<GlobalState>()(
  persist(
    (set) => ({
      theme: 'light',
      language: 'en',
      notifications: [],

      setTheme: (theme) => set({ theme }),
      
      setLanguage: (language) => set({ language }),
      
      addNotification: (notification) => 
        set((state) => ({ 
          notifications: [...state.notifications, notification] 
        })),
      
      removeNotification: (id) => 
        set((state) => ({ 
          notifications: state.notifications.filter(n => n.id !== id) 
        })),
    }),
    {
      name: 'global-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        theme: state.theme,
        language: state.language,
      }),
    }
  )
);

export default useGlobalStore;