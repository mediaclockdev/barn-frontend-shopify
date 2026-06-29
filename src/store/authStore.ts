import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface AuthUser {
  id: string; // Shopify ID is a string (GraphQL GID)
  email: string;
  username: string; // Keep for backward compatibility with UI
  first_name: string;
  last_name: string;
  display_name: string;
  billing?: {
    phone: string;
  };
}

type AuthPayload = Partial<AuthUser> & {
  // Legacy fields kept just in case, but primary is from Shopify
  wp_id?: number | string | null;
  user_id?: number | string | null;
  user_email?: string | null;
  user_nicename?: string | null;
  user_display_name?: string | null;
};

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  hasHydrated: boolean;
  setUser: (user: AuthPayload, token: string) => void;
  logout: () => void;
  setHasHydrated: (value: boolean) => void;
}

const parseUserId = (value: number | string | null | undefined): string => {
  if (typeof value === "string") return value;
  if (typeof value === "number") return value.toString();
  return "";
};

const normalizeAuthUser = (user: AuthPayload): AuthUser => ({
  id: parseUserId(user.id ?? user.user_id ?? user.wp_id),
  email: user.email ?? user.user_email ?? "",
  username: user.username ?? user.user_nicename ?? user.email ?? "",
  first_name: user.first_name ?? "",
  last_name: user.last_name ?? "",
  display_name: user.display_name ?? user.user_display_name ?? `${user.first_name || ""} ${user.last_name || ""}`.trim(),
});

const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      hasHydrated: false,
      setUser: (user, token) => set({ user: normalizeAuthUser(user), token }),
      logout: () => set({ user: null, token: null }),
      setHasHydrated: (value) => set({ hasHydrated: value }),
    }),
    {
      name: "auth-storage",
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);

export default useAuthStore;
