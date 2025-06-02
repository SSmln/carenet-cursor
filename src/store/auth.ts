import { create } from 'zustand';
import { User } from '@/types';

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
    // localStorage에 수동으로 저장
    if (user) {
      localStorage.setItem('carenet-auth', JSON.stringify(user));
    } else {
      localStorage.removeItem('carenet-auth');
    }
  },
  logout: () => {
    set({ user: null, isAuthenticated: false });
    localStorage.removeItem('carenet-auth');
  },
}));

// 페이지 로드 시 localStorage에서 사용자 정보 복원
if (typeof window !== 'undefined') {
  const storedUser = localStorage.getItem('carenet-auth');
  if (storedUser) {
    try {
      const user = JSON.parse(storedUser);
      useAuthStore.setState({ user, isAuthenticated: true });
    } catch (error) {
      console.error('Failed to parse stored user data:', error);
      localStorage.removeItem('carenet-auth');
    }
  }
} 