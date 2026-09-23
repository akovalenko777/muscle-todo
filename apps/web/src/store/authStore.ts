import { create } from 'zustand';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'USER' | 'ADMIN';
}

interface AuthState {
  authenticated: boolean
  accessToken: string | null;
  user: User | null;
  login: (accessToken: string, refreshToken: string, user: User) => void
  logout: () => void
  updateAccessToken: (accessToken: string) => void
  updateUser: (user: User) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  authenticated: false,
  accessToken: null,
  user: null,
  login: (accessToken, refreshToken, user) => {
    set({ accessToken: accessToken, user: user })
    localStorage.setItem('refreshToken', refreshToken)
  },
  logout(){
    set({ accessToken: null, user: null })
    localStorage.removeItem('refreshToken')
  },
  updateAccessToken: (accessToken) => set({ accessToken }),
  updateUser: (user) => set({ user })
}));