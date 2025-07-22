import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import ListaCorreos from './pages/ListaCorreos';
import EnviarCorreo from './pages/EnviarCorreo';
import './App.css';
function App() {
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
