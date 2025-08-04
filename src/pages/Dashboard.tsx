import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const [darkMode, setDarkMode] = useState(false);
  const navigate = useNavigate();

  return (
    <div className={`app ${darkMode ? 'dark' : 'light'}`}>
      <div className="container">
        <header className="header">
          <h1>¡Bienvenido a la App de Correos!</h1>
          <button 
            className="theme-toggle"
            onClick={() => setDarkMode(!darkMode)}
          >
            {darkMode ? '☀️' : '🌙'}
          </button>
        </header>

        <div className="dashboard-content">
          <div className="welcome-card">
            <p className="welcome-text">
              Esta aplicación te permite gestionar listas de correos y enviar mensajes masivos de forma sencilla y eficiente.
            </p>
            
            <div className="features-list">
              <div className="feature-item">
                <span className="feature-icon">📋</span>
                <div>
                  <h3>Crea y administra listas</h3>
                  <p>Organiza tus destinatarios en listas para campañas específicas</p>
                </div>
              </div>
              
              <div className="feature-item">
                <span className="feature-icon">📥</span>
                <div>
                  <h3>Importa correos fácilmente</h3>
                  <p>Desde archivos o agregando uno por uno</p>
                </div>
              </div>
              
              <div className="feature-item">
                <span className="feature-icon">✏️</span>
                <div>
                  <h3>Edita y elimina correos</h3>
                  <p>Mantén tus listas actualizadas y limpias</p>
                </div>
              </div>
              
              <div className="feature-item">
                <span className="feature-icon">✉️</span>
                <div>
                  <h3>Envía correos masivos</h3>
                  <p>A todos los integrantes de una lista con solo unos clics</p>
                </div>
              </div>
              
              <div className="feature-item">
                <span className="feature-icon">🌙</span>
                <div>
                  <h3>Modo claro/oscuro</h3>
                  <p>Para tu comodidad visual en cualquier momento del día</p>
                </div>
              </div>
              
              <div className="feature-item">
                <span className="feature-icon">🔒</span>
                <div>
                  <h3>Acceso seguro</h3>
                  <p>Solo para usuarios autorizados</p>
                </div>
              </div>
            </div>
          </div>

          <div className="cta-section">
            <button 
              className="btn primary"
              onClick={() => navigate('/')}
            >
              Ver Lista de Correos
            </button>
            <button 
              className="btn secondary"
              onClick={() => navigate('/enviar')}
            >
              Enviar Correo Masivo
            </button>
          </div>

          <div className="dashboard-footer">
            <span>Usa el menú superior o los botones para comenzar</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;