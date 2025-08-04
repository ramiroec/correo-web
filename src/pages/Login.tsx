import React, { useState } from 'react';

interface LoginProps {
  onLogin: (usuario: string, clave: string) => void;
  error?: string;
}

const Login: React.FC<LoginProps> = ({ onLogin, error }) => {
  const [usuario, setUsuario] = useState('');
  const [clave, setClave] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(usuario, clave);
  };

  return (
    <div className="login-container" style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f5f7fa'
    }}>
      <form
        onSubmit={handleSubmit}
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
};

export default Login;