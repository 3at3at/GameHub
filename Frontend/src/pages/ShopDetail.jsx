import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Row, Col, Card, Badge, Spinner, Button, Alert } from 'react-bootstrap';
import { shopsService, gamingStationsService } from '../services/api';

const ShopDetail = () => {
  const { id } = useParams();
  const [shop, setShop] = useState(null);
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setError('');
        const [shopRes, stationsRes] = await Promise.all([
          shopsService.getById(id),
          gamingStationsService.getByShop(id),
        ]);
        setShop(shopRes.data);
        setStations(stationsRes.data || []);
      } catch (error) {
        console.error('Error fetching shop details:', error);
        setError('Failed to load shop details. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    if (id) {
      fetchData();
    }
  }, [id]);

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  if (!shop) {
    return (
      <Container className="py-5">
        <Alert variant="warning">Shop not found</Alert>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <Row className="mb-4">
        <Col>
          <div style={{ animation: 'fadeInUp 0.6s ease-out' }}>
            <h1 className="fw-bold mb-2" style={{ fontSize: '2.5rem' }}>{shop.name}</h1>
            <p className="text-secondary mb-2" style={{ fontSize: '1.1rem' }}>
              📍 {shop.address}, {shop.city}, {shop.country}
            </p>
            <p className="text-secondary" style={{ fontSize: '1rem' }}>
              📞 {shop.phoneNumber} | ✉️ {shop.email}
            </p>
          </div>
        </Col>
      </Row>

      <Row className="mb-3">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <Badge bg="info" className="mb-2">Hourly Rate: ${shop.hourlyRate}</Badge>
              <Badge bg="secondary" className="mb-2 ms-2">{stations.length} Gaming Stations</Badge>
            </div>
          </div>
        </Col>
      </Row>

      <Row>
        <Col>
          <h4 className="mb-3">Gaming Stations</h4>
          {stations.length === 0 ? (
            <Card className="bg-dark border-secondary">
              <Card.Body>
                <p className="text-secondary">No gaming stations available</p>
              </Card.Body>
            </Card>
          ) : (
            <Row>
              {stations.map((station, index) => (
                <Col md={6} lg={4} key={station.id} className="mb-3">
                  <Card 
                    className="bg-dark border-secondary station-card h-100 animate-card"
                    style={{ 
                      cursor: 'pointer',
                      animationDelay: `${index * 0.1}s`
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#58a6ff';
                      e.currentTarget.style.transform = 'translateY(-5px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#6e7681';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <Card.Title className="mb-0 text-primary" style={{ fontSize: '1.1rem' }}>{station.name}</Card.Title>
                        <Badge
                          bg={
                            station.status === 'Available' || station.status === 0
                              ? 'success'
                              : station.status === 'InUse' || station.status === 2
                              ? 'warning'
                              : station.status === 'Reserved' || station.status === 1
                              ? 'info'
                              : 'secondary'
                          }
                        >
                          {station.status === 0 ? 'Available' : station.status === 1 ? 'Reserved' : station.status === 2 ? 'InUse' : station.status === 3 ? 'Maintenance' : station.status}
                        </Badge>
                      </div>
                      {station.nextAvailableTime && (
                        <p className="text-warning small mb-2">
                          ⏰ Available after: {new Date(station.nextAvailableTime).toLocaleString()}
                        </p>
                      )}
                      <p className="text-secondary mb-2 small">
                        <strong>Type:</strong> {station.type === 0 ? 'PC' : station.type === 1 ? 'PlayStation' : 'Xbox'}
                        <br />
                        <strong>Rate:</strong> ${station.hourlyRate}/hour
                      </p>
                      {station.specifications && (
                        <p className="text-secondary small mb-3" style={{ fontSize: '0.85rem' }}>
                          {station.specifications}
                        </p>
                      )}
                      <Button 
                        variant="outline-primary" 
                        size="sm"
                        className="w-100"
                        onClick={() => window.location.href = `/reservations?station=${station.id}`}
                        disabled={station.status === 2 || station.status === 'InUse'}
                      >
                        {station.status === 2 || station.status === 'InUse' ? 'Currently In Use' : 'Reserve This Station'}
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default ShopDetail;

