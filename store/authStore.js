import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { auth } from "../lib/api";

export const useAuthStore = create(
  persist(
    (set) => ({
      customer: null,
      token: null,

      login: async (email, password) => {
        try {
          const data = await auth.login(email, password);
          const token = data.access_token || data.token;

          // 1. Set token immediately so interceptors work
          set({ token });

          // 2. Fetch full user profile
          const userResponse = await auth.me();
          const user = userResponse.user || userResponse;

          const customer = {
            id: user.id,
            email: user.email,
            first_name: user.name?.split(" ")[0] || "User",
            last_name: user.name?.split(" ")[1] || "",
            addresses: user.addresses?.map(addr => ({
              id: addr.id,
              address_1: addr.street,
              city: addr.city,
              province: addr.state,
              postal_code: addr.zip,
              country_code: addr.country,
              phone: addr.phone,
            })) || [],
          };

          set({ customer });
        } catch (error) {
          console.error("Login failed", error);
          throw error;
        }
      },

      logout: async () => {
        set({ customer: null, token: null });
        window.location.href = "/register";
      },

      updateCustomer: async (data) => {
        // Placeholder or implement api.users.update
        console.log("Update customer not implemented yet", data);
      },

      syncWithBackend: async () => {
        try {
          const data = await auth.me();
          const user = data.user || data;
          const customer = {
            id: user.id,
            email: user.email,
            first_name: user.name?.split(" ")[0] || "User",
            last_name: user.name?.split(" ")[1] || "",
            addresses: user.addresses?.map(addr => ({
              id: addr.id,
              address_1: addr.street,
              city: addr.city,
              province: addr.state,
              postal_code: addr.zip,
              country_code: addr.country,
              phone: addr.phone,
              first_name: user.name?.split(" ")[0], // Addresses in backend don't have names, use user's
              last_name: user.name?.split(" ")[1],
            })) || [],
          };
          set({ customer });
        } catch (error) {
          console.error("Sync failed", error);
        }
      },
    }),
    {
      name: 'nimvu-auth-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);