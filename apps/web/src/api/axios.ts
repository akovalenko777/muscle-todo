import axios from 'axios';
import { useAuthStore } from '../store/authStore'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

let isRefreshing = false
let failedQueue: { reject: (err: unknown) => void, resolve: (token: string) => void }[] = []

const processQueue = (error: unknown | null, token: string | null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token as string)
    }
  })
  failedQueue = []
};

api.interceptors.request.use((config) => {
  const accessToken = useAuthStore.getState().accessToken
  if (accessToken) config.headers.Authorization = 'bearer ' + accessToken
  return config
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if(error.response?.status === 401 && !originalRequest._retry){
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then((token) => {
            originalRequest.headers["Authorization"] = `bearer ${token}`
            return api(originalRequest)
          })
          .catch((err) => Promise.reject(err))
      }

      originalRequest._retry = true
      isRefreshing = true

      const { updateAccessToken, logout } = useAuthStore.getState()
      try {
        const { data } = await axios.post(import.meta.env.VITE_API_URL+"/auth/refresh", {
          refreshToken: localStorage.getItem("refreshToken"),
        });

        const newToken = data.accessToken
        
        updateAccessToken(newToken)
        localStorage.setItem('refreshToken', data.refreshToken)
        api.defaults.headers.common["Authorization"] = `bearer ${newToken}`

        processQueue(null, newToken)
        return api(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError, null)
        logout()
        window.location.href = "/login"
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error);
  }
)

export default api;