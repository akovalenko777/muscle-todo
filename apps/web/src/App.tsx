import { Route, Routes } from "react-router-dom"
import LoginPage from "./pages/LoginPage"
import ProtectedRoute from "./components/ProtectedRoute"
import BoardPage from "./pages/BoardPage"
import IndexPage from "./pages/IndexPage"


function App() {

  return (
    <Routes>
      <Route path="/" element={<IndexPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/board" element={<BoardPage />} />
      </Route>
    </Routes>
  )
}

export default App
