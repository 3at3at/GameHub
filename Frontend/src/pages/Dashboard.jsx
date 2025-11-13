import { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Badge } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { reservationsService, tournamentsService } from '../services/api';

const Dashboard = () => {
  const { user } = useAuth();
  const [reservations, setReservations] = useState([]);
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [reservationsRes, tournamentsRes] = await Promise.all([
          reservationsService.getMyReservations(),
          tournamentsService.getMyRegistrations(),
        ]);
        setReservations(reservationsRes.data.slice(0, 5));
        setTournaments(tournamentsRes.data.slice(0, 5));
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <Row className="mb-5">
        <Col>
          <div style={{ animation: 'fadeInUp 0.6s ease-out' }}>
            <h1 className="fw-bold mb-2" style={{ fontSize: '2.5rem' }}>
              Welcome back, {user?.firstName}! 👋
            </h1>
            <p className="text-secondary" style={{ fontSize: '1.1rem' }}>Here's your gaming overview</p>
          </div>
        </Col>
      </Row>

      <Row className="mb-5">
        <Col md={4} className="mb-4">
          <Card className="bg-dark border-secondary text-center h-100 animate-card" style={{
            background: 'linear-gradient(135deg, rgba(88, 166, 255, 0.1) 0%, rgba(88, 166, 255, 0.05) 100%)',
            border: '2px solid rgba(88, 166, 255, 0.3)'
          }}>
            <Card.Body className="p-4">
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⭐</div>
              <h2 className="text-primary mb-2" style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{user?.loyaltyPoints || 0}</h2>
              <p className="text-secondary mb-0" style={{ fontSize: '1rem', fontWeight: '500' }}>Loyalty Points</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} className="mb-4">
          <Card className="bg-dark border-secondary text-center h-100 animate-card" style={{
            background: 'linear-gradient(135deg, rgba(63, 185, 80, 0.1) 0%, rgba(63, 185, 80, 0.05) 100%)',
            border: '2px solid rgba(63, 185, 80, 0.3)'
          }}>
            <Card.Body className="p-4">
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📅</div>
              <h2 className="text-success mb-2" style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{reservations.length}</h2>
              <p className="text-secondary mb-0" style={{ fontSize: '1rem', fontWeight: '500' }}>Active Reservations</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} className="mb-4">
          <Card className="bg-dark border-secondary text-center h-100 animate-card" style={{
            background: 'linear-gradient(135deg, rgba(210, 153, 34, 0.1) 0%, rgba(210, 153, 34, 0.05) 100%)',
            border: '2px solid rgba(210, 153, 34, 0.3)'
          }}>
            <Card.Body className="p-4">
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏆</div>
              <h2 className="text-warning mb-2" style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{tournaments.length}</h2>
              <p className="text-secondary mb-0" style={{ fontSize: '1rem', fontWeight: '500' }}>Tournament Registrations</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col md={6} className="mb-4">
          <Card className="bg-dark border-secondary h-100 animate-card">
            <Card.Header className="bg-dark border-secondary" style={{ 
              background: 'linear-gradient(135deg, rgba(88, 166, 255, 0.15) 0%, rgba(88, 166, 255, 0.05) 100%)',
              borderBottom: '2px solid rgba(88, 166, 255, 0.3)'
            }}>
              <h5 className="mb-0 text-white d-flex align-items-center">
                <span className="me-2">📋</span>
                Recent Reservations
              </h5>
            </Card.Header>
            <Card.Body>
              {reservations.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-secondary mb-0">No reservations yet</p>
                  <small className="text-secondary">Start by making your first reservation!</small>
                </div>
              ) : (
                <div className="list-group list-group-flush">
                  {reservations.map((res, index) => (
                    <div 
                      key={res.id} 
                      className="list-group-item bg-dark border-secondary"
                      style={{ 
                        animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both`,
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(88, 166, 255, 0.1)';
                        e.currentTarget.style.transform = 'translateX(5px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--bs-dark)';
                        e.currentTarget.style.transform = 'translateX(0)';
                      }}
                    >
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <strong className="text-white d-block mb-1">{res.gamingStationName}</strong>
                          <small className="text-secondary">
                            {new Date(res.startTime).toLocaleDateString()} {new Date(res.startTime).toLocaleTimeString()} - {new Date(res.endTime).toLocaleTimeString()}
                          </small>
                        </div>
                        <Badge bg={res.status === 'Confirmed' ? 'success' : 'secondary'} className="ms-3">
                          {res.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
        <Col md={6} className="mb-4">
          <Card className="bg-dark border-secondary h-100 animate-card">
            <Card.Header className="bg-dark border-secondary" style={{ 
              background: 'linear-gradient(135deg, rgba(210, 153, 34, 0.15) 0%, rgba(210, 153, 34, 0.05) 100%)',
              borderBottom: '2px solid rgba(210, 153, 34, 0.3)'
            }}>
              <h5 className="mb-0 text-white d-flex align-items-center">
                <span className="me-2">🎮</span>
                Tournament Registrations
              </h5>
            </Card.Header>
            <Card.Body>
              {tournaments.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-secondary mb-0">No tournament registrations yet</p>
                  <small className="text-secondary">Join a tournament to compete!</small>
                </div>
              ) : (
                <div className="list-group list-group-flush">
                  {tournaments.map((tournament, index) => (
                    <div 
                      key={tournament.id} 
                      className="list-group-item bg-dark border-secondary"
                      style={{ 
                        animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both`,
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(210, 153, 34, 0.1)';
                        e.currentTarget.style.transform = 'translateX(5px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--bs-dark)';
                        e.currentTarget.style.transform = 'translateX(0)';
                      }}
                    >
                      <div>
                        <strong className="text-white d-block mb-1">{tournament.tournamentName}</strong>
                        <small className="text-secondary">{tournament.game}</small>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;

