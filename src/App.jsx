import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Layout from './components/Layout';

function App() {
  return (
    <div className="app-container">
      <Routes>
        {/* Rutas públicas */}
        <Route path="/login" element={<Login />} />
        
        {/* Rutas protegidas */}
        <Route element={<Layout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<div>Dashboard (WIP)</div>} />
          <Route path="/player/:id" element={<div>Player (WIP)</div>} />
        </Route>
      </Routes>
    </div>
  )
}

export default App


