import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Shops from './pages/Shops';
import Reservations from './pages/Reservations';
import Tournaments from './pages/Tournaments';
import ShopDetail from './pages/ShopDetail';
import AdminDashboard from './pages/AdminDashboard';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

const PrivateRoute = ({ children }) => {
  const { user, loading, isAdmin } = useAuth();
  if (loading) {
    return <div className="text-center mt-5">Loading...</div>;
  }
  if (!user) {
    return <Navigate to="/login" />;
  }
  // Redirect admin away from user-only pages
  if (isAdmin() && (window.location.pathname === '/dashboard' || window.location.pathname === '/reservations')) {
    return <Navigate to="/admin" />;
  }
  return children;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }
      />
      <Route path="/shops" element={<Shops />} />
      <Route path="/shops/:id" element={<ShopDetail />} />
      <Route
        path="/reservations"
        element={
          <PrivateRoute>
            <Reservations />
          </PrivateRoute>
        }
      />
      <Route path="/tournaments" element={<Tournaments />} />
      <Route
        path="/admin"
        element={
          <PrivateRoute>
            <AdminDashboard />
          </PrivateRoute>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-vh-100 d-flex flex-column">
          <Navbar />
          <main className="flex-grow-1">
            <AppRoutes />
          </main>
          <footer className="bg-dark text-center py-3 mt-auto">
            <div className="container">
              <p className="mb-0 text-secondary">© 2024 GameHub - Smart Gaming Shop Management</p>
            </div>
          </footer>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
