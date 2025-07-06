// hooks/useAuthStore.ts
import { create } from "zustand";
import { User } from "@/types";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  setUser: (user) => {
    set({ user, isAuthenticated: !!user });
  },
  logout: () => {
    set({ user: null, isAuthenticated: false });
    // 서버에 로그아웃 API 호출 (쿠키 삭제)
    fetch("/api/auth/logout", { method: "POST", credentials: "include" });
  },
}));
