import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import LiveData from './pages/LiveData';
import Diagnostics from './pages/Diagnostics';
import History from './pages/History';
import Export from './pages/Export';
import Settings from './pages/Settings'; // ✅ Ενεργοποιήθηκε
import Login from './pages/Login';
import Register from './pages/Register';
import ProtectedRoute from './components/ProtectedRoute';
import Header from './components/Header';

function App() {
  const token = localStorage.getItem('token');

  return (
    <Router>
      {/* Header πάνω από όλες τις σελίδες */}
      <Header />

      <Routes>
        {/* Public */}
        <Route path="/" element={<Home />} />

        {/* Auth */}
        <Route path="/login" element={token ? <Navigate to="/" /> : <Login />} />
        <Route path="/register" element={token ? <Navigate to="/" /> : <Register />} />

        {/* Protected */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/live" element={<ProtectedRoute><LiveData /></ProtectedRoute>} />
        <Route path="/diagnostics" element={<ProtectedRoute><Diagnostics /></ProtectedRoute>} />
        <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
        <Route path="/export" element={<ProtectedRoute><Export /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} /> {/* ✅ Προστέθηκε */}
      </Routes>
    </Router>
  );
}

export default App;





