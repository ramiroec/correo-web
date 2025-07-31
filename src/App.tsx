import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import ListaCorreos from './pages/ListaCorreos';
import EnviarCorreo from './pages/EnviarCorreo';
import './App.css';

function App() {
  const [autenticado, setAutenticado] = useState(false);
  const [usuario, setUsuario] = useState('');
  const [clave, setClave] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (usuario === 'diazgill' && clave === 'diazgill') {
      setAutenticado(true);
      setError('');
    } else {
      setError('Usuario o clave incorrectos');
    }
  };

  if (!autenticado) {
    return (
      <div className="login-container" style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f5f7fa'
      }}>
        <form
          onSubmit={handleLogin}
          style={{
            background: '#fff',
            padding: 32,
            borderRadius: 12,
            boxShadow: '0 2px 16px #0001',
            minWidth: 320
          }}
        >
          <h2 style={{ textAlign: 'center', marginBottom: 24 }}>🔒 Iniciar Sesión</h2>
          <div style={{ marginBottom: 16 }}>
            <input
              type="text"
              placeholder="Usuario"
              value={usuario}
              onChange={e => setUsuario(e.target.value)}
              className="input"
              style={{ width: '100%' }}
              autoFocus
            />
          </div>
          <div style={{ marginBottom: 16 }}>
            <input
              type="password"
              placeholder="Clave"
              value={clave}
              onChange={e => setClave(e.target.value)}
              className="input"
              style={{ width: '100%' }}
            />
          </div>
          {error && (
            <div style={{ color: '#e74c3c', marginBottom: 12, textAlign: 'center' }}>
              {error}
            </div>
          )}
          <button
            type="submit"
            className="btn primary"
            style={{ width: '100%' }}
          >
            Entrar
          </button>
        </form>
      </div>
    );
  }

  return (
    <Router>
      <div style={{ padding: 20 }}>
        <h1>📧 App de Correos</h1>
        <nav style={{ marginBottom: 20 }}>
          <Link to="/" style={{ marginRight: 10 }}>📋 Lista de Correos</Link>
          <Link to="/enviar">✉️ Enviar Correo</Link>
        </nav>

        <Routes>
          <Route path="/" element={<ListaCorreos />} />
          <Route path="/enviar" element={<EnviarCorreo />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
