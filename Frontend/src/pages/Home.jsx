import { Link, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';

const Home = () => {
  const navigate = useNavigate();

  return (
    <Container className="py-5">
      <Row className="text-center mb-5">
        <Col>
          <h1 className="display-3 fw-bold mb-3">
            <span className="text-primary">🎮</span> GameHub
          </h1>
          <p className="lead text-secondary">
            Smart Management System for Gaming Shops
          </p>
          <p className="text-muted">
            Book your gaming session, join tournaments, and earn rewards!
          </p>
          <div className="mt-4">
            <Button as={Link} to="/shops" variant="primary" size="lg" className="me-2">
              Find Gaming Shops
            </Button>
            <Button as={Link} to="/tournaments" variant="outline-primary" size="lg">
              View Tournaments
            </Button>
          </div>
        </Col>
      </Row>

      <Row className="mt-5">
        <Col md={4} className="mb-4">
          <Card 
            className="feature-card h-100 bg-dark border-secondary" 
            style={{ cursor: 'pointer' }}
            onClick={() => navigate('/reservations')}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = '#58a6ff'}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = '#6e7681'}
          >
            <Card.Body className="text-center">
              <div className="game-icon">📅</div>
              <Card.Title className="text-white">Online Reservations</Card.Title>
              <Card.Text className="text-white">
                Book your PC or PlayStation spot in advance. See real-time availability and never wait in line again.
              </Card.Text>
              <small className="text-primary">Click to make a reservation →</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} className="mb-4">
          <Card 
            className="feature-card h-100 bg-dark border-secondary"
            style={{ cursor: 'pointer' }}
            onClick={() => navigate('/dashboard')}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = '#58a6ff'}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = '#6e7681'}
          >
            <Card.Body className="text-center">
              <div className="game-icon">⏱️</div>
              <Card.Title className="text-white">Smart Time Tracking</Card.Title>
              <Card.Text className="text-white">
                Automatic billing with accurate playtime calculation. No more manual tracking or billing errors.
              </Card.Text>
              <small className="text-primary">View your dashboard →</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} className="mb-4">
          <Card 
            className="feature-card h-100 bg-dark border-secondary"
            style={{ cursor: 'pointer' }}
            onClick={() => navigate('/tournaments')}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = '#58a6ff'}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = '#6e7681'}
          >
            <Card.Body className="text-center">
              <div className="game-icon">🏆</div>
              <Card.Title className="text-white">Tournament Management</Card.Title>
              <Card.Text className="text-white">
                Join FIFA, Valorant, CS2, or Tekken tournaments. Online registration with auto-generated brackets.
              </Card.Text>
              <small className="text-primary">Browse tournaments →</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} className="mb-4">
          <Card 
            className="feature-card h-100 bg-dark border-secondary"
            style={{ cursor: 'pointer' }}
            onClick={() => navigate('/dashboard')}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = '#58a6ff'}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = '#6e7681'}
          >
            <Card.Body className="text-center">
              <div className="game-icon">⭐</div>
              <Card.Title className="text-white">Loyalty Program</Card.Title>
              <Card.Text className="text-white">
                Earn points for every hour played. Redeem points for free hours, snacks, or discounts.
              </Card.Text>
              <small className="text-primary">Check your points →</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} className="mb-4">
          <Card 
            className="feature-card h-100 bg-dark border-secondary"
            style={{ cursor: 'pointer' }}
            onClick={() => navigate('/dashboard')}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = '#58a6ff'}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = '#6e7681'}
          >
            <Card.Body className="text-center">
              <div className="game-icon">👥</div>
              <Card.Title className="text-white">Community Features</Card.Title>
              <Card.Text className="text-white">
                Player profiles with stats & rankings. Leaderboards for top players per shop or city.
              </Card.Text>
              <small className="text-primary">View your profile →</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Home;

