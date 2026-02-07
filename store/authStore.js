import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { sdk } from "../app/lib/sdk";

export const useAuthStore = create(
  persist(
    (set) => ({
      customer: null,

      login: async (email, password) => {
        await sdk.auth.login("customer", "emailpass", { email, password });
        const { customer } = await sdk.store.customer.retrieve();
        set({ customer });
      },

      logout: async () => {
        await sdk.auth.logout();
        set({ customer: null }); 
        window.location.href = "/register";
      },

      updateCustomer: async (data) => {
        const { customer } = await sdk.store.customer.update(data);
        set({ customer });
      },
      
      syncWithBackend: async () => {
        try {
          const { customer } = await sdk.store.customer.retrieve();
          set({ customer }); 
        } catch (e) {
          set({ customer: null });
        }
      },
    }),
    {
      name: 'nimvu-auth-storage', 
      storage: createJSONStorage(() => localStorage),
    }
  )
);