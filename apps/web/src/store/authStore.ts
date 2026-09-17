import { create } from 'zustand';

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthState {
  accessToken: string | null;
  user: User | null;
  login: (accessToken: string, refreshToken: string, user: User) => void
  logout: () => void
  updateAccessToken: (accessToken: string) => void
}

export const useAuthStore = create<AuthState>((set) => ({
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
  updateAccessToken: (accessToken) => set({ accessToken })
}));