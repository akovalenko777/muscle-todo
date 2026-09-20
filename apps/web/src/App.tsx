import { Route, Routes } from "react-router-dom"
import LoginPage from "./pages/LoginPage"
import ProtectedRoute from "./components/ProtectedRoute"
import BoardPage from "./pages/BoardPage"
import IndexPage from "./pages/IndexPage"
import RegisterPage from "./pages/RegisterPage"


function App() {

  return (
    <Routes>
      <Route path="/" element={<IndexPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/board" element={<BoardPage />} />
      </Route>
    </Routes>
  )
}

export default App
