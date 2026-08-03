import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Player from './pages/Player';
import Settings from './pages/Settings';

function App() {
  return (
    <div className="app-container">
      <Routes>
        {/* Rutas públicas */}
        <Route path="/login" element={<Login />} />
        
        {/* Rutas protegidas */}
        <Route element={<Layout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
        
        {/* Reproductor (Sin Layout porque es pantalla completa) */}
        <Route path="/player/:id" element={<Player />} />
      </Routes>
    </div>
  )
}

export default App


