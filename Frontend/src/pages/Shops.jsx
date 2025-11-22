import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Spinner } from 'react-bootstrap';
import { shopsService } from '../services/api';

const Shops = () => {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchShops = async () => {
      try {
        const response = await shopsService.getAll();
        setShops(response.data);
      } catch (error) {
        console.error('Error fetching shops:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchShops();
  }, []);

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <Row className="mb-5">
        <Col>
          <div style={{ animation: 'fadeInUp 0.6s ease-out' }}>
            <h1 className="fw-bold mb-2" style={{ fontSize: '2.5rem' }}>Gaming Shops</h1>
            <p className="text-secondary" style={{ fontSize: '1.1rem' }}>Find the perfect gaming spot</p>
          </div>
        </Col>
      </Row>
      <Row>
        {shops.length === 0 ? (
          <Col>
            <Card className="bg-dark border-secondary text-center py-5 animate-card">
              <Card.Body>
                <p className="text-secondary">No shops available at the moment</p>
              </Card.Body>
            </Card>
          </Col>
        ) : (
          shops.map((shop, index) => (
            <Col md={6} lg={4} key={shop.id} className="mb-4">
              <Card className="bg-dark border-secondary h-100 animate-card d-flex flex-column" style={{ animationDelay: `${index * 0.1}s` }}>
                <Card.Body className="p-4 d-flex flex-column">
                  <Card.Title className="text-primary mb-3" style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{shop.name}</Card.Title>
                  <Card.Text className="text-secondary mb-3 flex-grow-1">
                    <div className="mb-2">
                      <strong className="text-white">📍</strong> <span className="ms-2">{shop.address}, {shop.city}, {shop.country}</span>
                    </div>
                    <div className="mb-2">
                      <strong className="text-white">💰</strong> <span className="ms-2">${shop.hourlyRate}/hour</span>
                    </div>
                    <div>
                      <strong className="text-white">📞</strong> <span className="ms-2">{shop.phoneNumber}</span>
                    </div>
                  </Card.Text>
                  <Button 
                    as={Link} 
                    to={`/shops/${shop.id}`} 
                    variant="primary" 
                    className="w-100 mt-auto"
                    style={{
                      borderRadius: '6px',
                      padding: '0.75rem',
                      fontWeight: '600'
                    }}
                  >
                    View Details →
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))
        )}
      </Row>
    </Container>
  );
};

export default Shops;

