import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Navbar as BootstrapNavbar, Nav, Container, Button } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleAdminNavClick = (tab) => {
    if (location.pathname === '/admin') {
      // If already on admin page, trigger tab change via event
      window.dispatchEvent(new CustomEvent('adminTabChange', { detail: tab }));
    } else {
      navigate(`/admin?tab=${tab}`);
    }
  };

  return (
    <BootstrapNavbar bg="dark" variant="dark" expand="lg" className="border-bottom border-secondary">
      <Container>
        <BootstrapNavbar.Brand as={Link} to="/" className="fw-bold text-primary">
          🎮 GameHub
        </BootstrapNavbar.Brand>
        <BootstrapNavbar.Toggle aria-controls="basic-navbar-nav" />
        <BootstrapNavbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            {isAdmin() ? (
              <>
                <Nav.Link 
                  onClick={(e) => {
                    e.preventDefault();
                    handleAdminNavClick('shops');
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  Shops
                </Nav.Link>
                <Nav.Link 
                  onClick={(e) => {
                    e.preventDefault();
                    handleAdminNavClick('tournaments');
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  Tournaments
                </Nav.Link>
                <Nav.Link 
                  onClick={(e) => {
                    e.preventDefault();
                    handleAdminNavClick('users');
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  Users
                </Nav.Link>
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/">Home</Nav.Link>
                <Nav.Link as={Link} to="/shops">Shops</Nav.Link>
                <Nav.Link as={Link} to="/tournaments">Tournaments</Nav.Link>
                {user && (
                  <>
                    <Nav.Link as={Link} to="/dashboard">Dashboard</Nav.Link>
                    <Nav.Link as={Link} to="/reservations">My Reservations</Nav.Link>
                  </>
                )}
              </>
            )}
          </Nav>
          <Nav>
            {user ? (
              <>
                <Nav.Link className="text-primary">Welcome, {user.firstName}!</Nav.Link>
                <Button variant="outline-danger" size="sm" onClick={handleLogout}>
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/login">Login</Nav.Link>
                <Button as={Link} to="/register" variant="primary" size="sm">
                  Sign Up
                </Button>
              </>
            )}
          </Nav>
        </BootstrapNavbar.Collapse>
      </Container>
    </BootstrapNavbar>
  );
};

export default Navbar;

