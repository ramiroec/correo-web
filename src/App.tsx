import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, Navigate } from 'react-router-dom';
import ListaCorreos from './pages/ListaCorreos';
import EnviarCorreo from './pages/EnviarCorreo';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import './App.css';

function App() {
  const [autenticado, setAutenticado] = useState(false);
  const [error, setError] = useState('');

  // Verificar si hay autenticación guardada al cargar la aplicación
  useEffect(() => {
    const loggedIn = localStorage.getItem('autenticado') === 'true';
    if (loggedIn) {
      setAutenticado(true);
    }
  }, []);

  const handleLogin = (usuario: string, clave: string) => {
    if (usuario === 'diazgill' && clave === 'diazgill') {
      setAutenticado(true);
      localStorage.setItem('autenticado', 'true'); // Guardar en localStorage
      setError('');
    } else {
      setError('Usuario o clave incorrectos');
    }
  };

  const handleLogout = () => {
    setAutenticado(false);
    localStorage.removeItem('autenticado'); // Limpiar al cerrar sesión
  };

  if (!autenticado) {
    return <Login onLogin={handleLogin} error={error} />;
  }

  return (
    <Router>
      <div style={{ padding: 20 }}>
        <h1>📧 App de Correos</h1>
        <nav style={{ marginBottom: 20 }}>
          <Link to="/dashboard" style={{ marginRight: 10 }}>🏠 Dashboard</Link>
          <Link to="/" style={{ marginRight: 10 }}>📋 Lista de Correos</Link>
          <Link to="/enviar" style={{ marginRight: 10 }}>✉️ Enviar Correo</Link>
          <button onClick={handleLogout} className="btn secondary">
            Cerrar sesión
          </button>
        </nav>
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/" element={<ListaCorreos />} />
          <Route path="/enviar" element={<EnviarCorreo />} />
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;