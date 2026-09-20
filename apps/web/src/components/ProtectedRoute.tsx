import { Outlet, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { Button } from "@mui/material";
import { useEffect, useState, useEffectEvent } from "react";
import api from "../api/axios";
import type { AxiosResponse } from "axios";
import Loader from "./Loader";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute() {
  const { accessToken, logout, updateUser } = useAuthStore()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)

  const restoreSessionOrRedirect = async () => {
    try {
      const userResponse: AxiosResponse = await api.get('/users/me')
      updateUser(userResponse.data)
    } catch {
      navigate('/login')
    } finally {
      setLoading(false)
    }
  }

  const onMountCheck = useEffectEvent(() => {
    void restoreSessionOrRedirect()
  })

  useEffect(() => {
    onMountCheck()
  }, [])

  if(!localStorage.getItem('refreshToken')) {
    navigate('/login')
    return
  }

  if (loading) return <Loader />
  if (!accessToken) return <Navigate to="/login" replace />

  return (
    <div className="application">
      <Button variant="contained" onClick={logout}>Вийти</Button>
      <Outlet />
    </div>
  )
}