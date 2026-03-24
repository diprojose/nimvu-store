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

          // 2. Fetch full user profile explicitly bypassing interceptor delay
          const userResponse = await auth.me(token);
          const user = userResponse.user || userResponse;

          const customer = {
            id: user.id,
            email: user.email,
            first_name: user.name?.split(" ")[0] || "User",
            last_name: user.name?.split(" ")[1] || "",
            role: user.role,
            companyName: user.companyName,
            isB2BApproved: user.isB2BApproved,
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

      loginB2B: async (email, password) => {
        try {
          const data = await auth.login(email, password);
          const tempToken = data.access_token || data.token;

          const userResponse = await auth.me(tempToken);
          const user = userResponse.user || userResponse;

          if (user.role !== 'B2B' && user.role !== 'ADMIN') {
            throw new Error("Esta cuenta no tiene permisos corporativos (B2B).");
          }

          if (user.role === 'B2B' && !user.isB2BApproved) {
            throw new Error("Tu cuenta corporativa está pendiente de aprobación por un administrador.");
          }

          const customer = {
            id: user.id,
            email: user.email,
            first_name: user.name?.split(" ")[0] || "User",
            last_name: user.name?.split(" ")[1] || "",
            role: user.role,
            companyName: user.companyName,
            isB2BApproved: user.isB2BApproved,
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

          set({ token: tempToken, customer });
        } catch (error) {
          console.error("B2B Login failed", error);
          throw error;
        }
      },

      logout: async (redirect = "/register") => {
        set({ customer: null, token: null });
        if (redirect) {
          window.location.href = redirect;
        }
      },

      clearSession: () => {
        set({ customer: null, token: null });
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
            role: user.role,
            companyName: user.companyName,
            isB2BApproved: user.isB2BApproved,
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