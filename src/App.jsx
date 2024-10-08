import Room from "./pages/Room"
import LoginPage from "./pages/LoginPage"
import RegisterPage from "./pages/RegisterPage"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import PrivateRoutes from "./utils/PrivateRoutes"
import { AuthProvider } from "./utils/AuthContext"

function App() {

  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path='/login' element={<LoginPage />}></Route>
          <Route path='/register' element={<RegisterPage />}></Route>
          <Route element={<PrivateRoutes />}>
            <Route path='/' element={<Room />}></Route>
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  )
}

export default App
