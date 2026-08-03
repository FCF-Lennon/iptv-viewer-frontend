import { Routes, Route, Navigate } from 'react-router-dom'

function App() {
  return (
    <div className="app-container">
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/login" element={<div>Login Page (WIP)</div>} />
        <Route path="/dashboard" element={<div>Dashboard (WIP)</div>} />
        <Route path="/player/:id" element={<div>Player (WIP)</div>} />
      </Routes>
    </div>
  )
}

export default App
