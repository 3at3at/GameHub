import { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Badge, Spinner, Alert } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { tournamentsService } from '../services/api';

const Tournaments = () => {
  const { user } = useAuth();
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchTournaments();
  }, []);

  const fetchTournaments = async () => {
    try {
      const response = await tournamentsService.getAll({ status: 'RegistrationOpen' });
      setTournaments(response.data);
    } catch (error) {
      console.error('Error fetching tournaments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (tournamentId) => {
    if (!user) {
      setMessage({ type: 'warning', text: 'Please login to register for tournaments' });
      return;
    }

    try {
      await tournamentsService.register(tournamentId);
      setMessage({ type: 'success', text: 'Successfully registered for tournament!' });
      fetchTournaments();
    } catch (error) {
      setMessage({
        type: 'danger',
        text: error.response?.data?.message || 'Failed to register for tournament',
      });
    }
  };

  // Helper function to compare dates (ignoring time)
  const compareDates = (date1, date2) => {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    d1.setHours(0, 0, 0, 0);
    d2.setHours(0, 0, 0, 0);
    return d1 >= d2;
  };

  // Helper function to check if registration is open
  const isRegistrationOpen = (tournament) => {
    const statusStr = String(tournament.status);
    return statusStr === 'RegistrationOpen' || statusStr === '1';
  };

  // Helper function to check if button should be disabled
  const isButtonDisabled = (tournament) => {
    const hasUser = !!user;
    const isFull = tournament.currentParticipants >= tournament.maxParticipants;
    const deadlinePassed = compareDates(new Date(), tournament.registrationDeadline);
    const statusOpen = isRegistrationOpen(tournament);
    
    const disabled = !hasUser || isFull || deadlinePassed || !statusOpen;
    
    // Debug logging to help identify issues
    if (disabled) {
      console.log(`Button disabled for "${tournament.name}":`, {
        hasUser,
        isFull,
        deadlinePassed,
        statusOpen,
        status: tournament.status,
        statusType: typeof tournament.status,
        currentParticipants: tournament.currentParticipants,
        maxParticipants: tournament.maxParticipants,
        currentDate: new Date().toISOString(),
        deadline: new Date(tournament.registrationDeadline).toISOString(),
        deadlineDateOnly: new Date(tournament.registrationDeadline).toLocaleDateString()
      });
    }
    
    return disabled;
  };

  // Helper function to get button title
  const getButtonTitle = (tournament) => {
    if (!user) return "Please login to register";
    if (tournament.currentParticipants >= tournament.maxParticipants) return "Tournament is full";
    if (compareDates(new Date(), tournament.registrationDeadline)) {
      return `Registration closed on ${new Date(tournament.registrationDeadline).toLocaleDateString()}`;
    }
    if (!isRegistrationOpen(tournament)) return "Registration is not open";
    return "Register for this tournament";
  };

  // Helper function to get button text
  const getButtonText = (tournament) => {
    if (compareDates(new Date(), tournament.registrationDeadline)) return "Registration Closed";
    if (tournament.currentParticipants >= tournament.maxParticipants) return "Tournament Full";
    return "Register Now";
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <Row className="mb-3">
        <Col>
          <div style={{ animation: 'fadeInUp 0.6s ease-out' }}>
            <h1 className="fw-bold mb-2" style={{ fontSize: '2.5rem' }}>Tournaments</h1>
            <p className="text-secondary mb-0" style={{ fontSize: '1.1rem' }}>Join exciting gaming tournaments and compete for prizes!</p>
          </div>
        </Col>
      </Row>

      {message.text && (
        <Alert
          variant={message.type}
          dismissible
          onClose={() => setMessage({ type: '', text: '' })}
        >
          {message.text}
        </Alert>
      )}

      <Row>
        {tournaments.length === 0 ? (
          <Col>
            <Card className="bg-dark border-secondary text-center py-5">
              <Card.Body>
                <p className="text-secondary">No tournaments available at the moment</p>
              </Card.Body>
            </Card>
          </Col>
        ) : (
          tournaments.map((tournament, index) => {
            // Get game image based on game name - using real official game cover art
            const getGameImage = (gameName) => {
              const gameImages = {
                'FIFA 24': 'https://cdn.akamai.steamstatic.com/steam/apps/2195250/header.jpg',
                'FIFA': 'https://cdn.akamai.steamstatic.com/steam/apps/2195250/header.jpg',
                'Valorant': 'https://cdn.akamai.steamstatic.com/steam/apps/1270790/header.jpg',
                'Counter-Strike 2': 'https://cdn.akamai.steamstatic.com/steam/apps/730/header.jpg',
                'CS2': 'https://cdn.akamai.steamstatic.com/steam/apps/730/header.jpg',
                'Tekken 8': 'https://cdn.akamai.steamstatic.com/steam/apps/1778820/header.jpg',
                'Tekken': 'https://cdn.akamai.steamstatic.com/steam/apps/1778820/header.jpg',
                'Rocket League': 'https://cdn.akamai.steamstatic.com/steam/apps/252950/header.jpg',
              };
              
              // Try to find matching game image
              const gameNameLower = gameName.toLowerCase();
              for (const [key, value] of Object.entries(gameImages)) {
                if (gameNameLower.includes(key.toLowerCase())) {
                  return value;
                }
              }
              
              // Default gaming image
              return 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&h=600&fit=crop';
            };

            return (
              <Col md={6} lg={4} key={tournament.id} className="mb-4">
                <Card className="bg-dark border-secondary tournament-card h-100 d-flex flex-column animate-card" style={{ animationDelay: `${index * 0.1}s` }}>
                  <div 
                    style={{ 
                      height: '150px', 
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                  >
                    <img 
                      src={getGameImage(tournament.game)} 
                      alt={tournament.game}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&h=600&fit=crop';
                      }}
                    />
                  </div>
                  <Card.Body className="d-flex flex-column">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <Card.Title className="text-primary mb-0" style={{ fontSize: '1.1rem' }}>{tournament.name}</Card.Title>
                      <Badge bg="info">{tournament.status}</Badge>
                    </div>
                    <Card.Text className="small mb-2 flex-grow-1 text-white">
                      <strong className="text-white">Game:</strong> <span className="text-white">{tournament.game}</span>
                      <br />
                      <strong className="text-white">Shop:</strong> <span className="text-white">{tournament.shopName}</span>
                      <br />
                      <strong className="text-white">Start:</strong> <span className="text-white">{new Date(tournament.startDate).toLocaleDateString()}</span>
                      <br />
                      <strong className="text-white">Registration Deadline:</strong> <span className={new Date(tournament.registrationDeadline) < new Date() ? "text-danger" : "text-white"}>{new Date(tournament.registrationDeadline).toLocaleDateString()}</span>
                      <br />
                      <strong className="text-white">Entry Fee:</strong> <span className="text-white">${tournament.entryFee}</span> | <strong className="text-white">Prize:</strong> <span className="text-white">${tournament.prizePool}</span>
                      <br />
                      <strong className="text-white">Participants:</strong> <span className="text-white">{tournament.currentParticipants}/{tournament.maxParticipants}</span>
                    </Card.Text>
                    {tournament.description && (
                      <Card.Text className="text-secondary small mb-2" style={{ fontSize: '0.85rem' }}>
                        {tournament.description}
                      </Card.Text>
                    )}
                    <Button
                      variant="primary"
                      onClick={() => handleRegister(tournament.id)}
                      disabled={isButtonDisabled(tournament)}
                      className="w-100 mt-auto"
                      size="sm"
                      title={getButtonTitle(tournament)}
                    >
                      {getButtonText(tournament)}
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            );
          })
        )}
      </Row>
    </Container>
  );
};

export default Tournaments;

