import { Routes, Route, Navigate } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import ProtectedRoute from './components/ProtectedRoute'
import { useAuth } from './context/AuthContext'
import Listas from './pages/Listas'
import Enviar from './pages/Enviar'

export default function App() {
  const { isAuthenticated } = useAuth()

  return (
    <div className="app-shell">
      {isAuthenticated && <Sidebar />}
      <main className="app-content">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>}/>
          <Route path="/listas" element={<ProtectedRoute><Listas /></ProtectedRoute>} />
          <Route path="/enviar" element={<ProtectedRoute><Enviar/></ProtectedRoute>} />
          <Route path="*" element={<Navigate to={isAuthenticated ? '/' : '/login'} replace />} />
        </Routes>
      </main>
    </div>
  )
}
