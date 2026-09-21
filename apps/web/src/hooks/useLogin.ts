import { useAuthStore } from "../store/authStore";
import api from "../api/axios";
import type { AxiosResponse } from "axios";
import { useNavigate } from "react-router-dom";

export default function useLogin(){
  const login = useAuthStore(store => store.login)
  const navigate = useNavigate()

  const doLogin = async (path: string, data: Record<string, string>) => {
    const response: AxiosResponse = await api.post(path, data)
    if (response.status === 200) {
      const { accessToken, refreshToken, user } = response.data
      login(accessToken, refreshToken, user)
      navigate('/board')
    }
  }
  
  return { doLogin }
}