import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Badge, Modal, Form, Alert, Spinner } from 'react-bootstrap';
import { reservationsService, gamingStationsService, shopsService } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Reservations = () => {
  const { user, refreshUser } = useAuth();
  const [searchParams] = useSearchParams();
  const [reservations, setReservations] = useState([]);
  const [allStations, setAllStations] = useState([]);
  const [shops, setShops] = useState([]);
  const [selectedShop, setSelectedShop] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    gamingStationId: '',
    startTime: '',
    endTime: '',
    notes: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedStationDetails, setSelectedStationDetails] = useState(null);
  const [estimatedPrice, setEstimatedPrice] = useState(0);
  const [freeHoursApplied, setFreeHoursApplied] = useState(false);

  useEffect(() => {
    fetchReservations();
    fetchShops();
    const stationParam = searchParams.get('station');
    if (stationParam) {
      setFormData(prev => ({ ...prev, gamingStationId: stationParam }));
      setShowModal(true);
    }
  }, [searchParams]);

  useEffect(() => {
    // Always fetch stations, even without time selection
    if (selectedShop) {
      fetchStationsForShop(selectedShop);
    } else {
      fetchAllStations();
    }
  }, [selectedShop, formData.startTime, formData.endTime]);

  // Also fetch on initial load when modal opens
  useEffect(() => {
    if (showModal) {
      if (selectedShop) {
        fetchStationsForShop(selectedShop);
      } else {
        fetchAllStations();
      }
    }
  }, [showModal]);

  const fetchReservations = async () => {
    try {
      const response = await reservationsService.getMyReservations();
      setReservations(response.data);
    } catch (error) {
      console.error('Error fetching reservations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchShops = async () => {
    try {
      const response = await shopsService.getAll();
      setShops(response.data);
    } catch (error) {
      console.error('Error fetching shops:', error);
    }
  };

  const fetchAllStations = async () => {
    try {
      const params = {};
      // Don't send start/end time if not selected - this ensures we get ALL stations
      // The backend will still return all stations with their status
      if (formData.startTime) params.startTime = new Date(formData.startTime).toISOString();
      if (formData.endTime) params.endTime = new Date(formData.endTime).toISOString();
      const response = await gamingStationsService.getAvailable(params);
      console.log('Fetched all stations:', response.data);
      // Ensure we set all stations, regardless of availability
      setAllStations(response.data || []);
    } catch (error) {
      console.error('Error fetching stations:', error);
      setAllStations([]);
    }
  };

  const fetchStationsForShop = async (shopId) => {
    try {
      const params = { shopId };
      // Don't send start/end time if not selected - this ensures we get ALL stations for the shop
      if (formData.startTime) params.startTime = new Date(formData.startTime).toISOString();
      if (formData.endTime) params.endTime = new Date(formData.endTime).toISOString();
      const response = await gamingStationsService.getAvailable(params);
      console.log(`Fetched stations for shop ${shopId}:`, response.data);
      // Ensure we set all stations, regardless of availability
      setAllStations(response.data || []);
    } catch (error) {
      console.error('Error fetching stations:', error);
      setAllStations([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await reservationsService.create({
        ...formData,
        startTime: new Date(formData.startTime).toISOString(),
        endTime: new Date(formData.endTime).toISOString(),
      });
      
      let successMessage = 'Reservation created successfully!';
      if (freeHoursApplied) {
        successMessage += ' 🎉 2 hours free applied! (50 points deducted)';
      }
      
      setSuccess(successMessage);
      const currentShop = selectedShop;
      setShowModal(false);
      setFormData({ gamingStationId: '', startTime: '', endTime: '', notes: '' });
      setSelectedShop('');
      setSelectedStationDetails(null);
      setEstimatedPrice(0);
      setFreeHoursApplied(false);
      fetchReservations();
      
      // Refresh user data to update loyalty points
      if (freeHoursApplied) {
        const userData = localStorage.getItem('user');
        if (userData) {
          const updatedUser = JSON.parse(userData);
          updatedUser.loyaltyPoints = Math.max(0, updatedUser.loyaltyPoints - 50);
          localStorage.setItem('user', JSON.stringify(updatedUser));
          refreshUser();
        }
      }
      // Refresh stations list
      setTimeout(() => {
        if (currentShop) {
          setSelectedShop(currentShop);
        }
      }, 100);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create reservation');
    }
  };

  const calculatePrice = (station, startTime, endTime) => {
    if (!station || !startTime || !endTime) {
      setEstimatedPrice(0);
      setFreeHoursApplied(false);
      return;
    }

    const start = new Date(startTime);
    const end = new Date(endTime);
    const hours = (end - start) / (1000 * 60 * 60);
    
    if (hours > 0) {
      // Check if user has 50+ loyalty points and reservation is >= 2 hours
      const hasFreeHours = user?.loyaltyPoints >= 50 && hours >= 2;
      const freeHours = hasFreeHours ? Math.min(2, hours) : 0;
      const billableHours = hours - freeHours;
      const price = billableHours * station.hourlyRate;
      
      setEstimatedPrice(price);
      setFreeHoursApplied(hasFreeHours);
    } else {
      setEstimatedPrice(0);
      setFreeHoursApplied(false);
    }
  };

  const handleCancel = async (id) => {
    if (window.confirm('Are you sure you want to cancel this reservation?')) {
      try {
        await reservationsService.cancel(id);
        setSuccess('Reservation cancelled successfully!');
        fetchReservations();
      } catch (error) {
        setError(error.response?.data?.message || 'Failed to cancel reservation');
      }
    }
  };

  const handleComplete = async (id) => {
    if (window.confirm('Mark this reservation as completed? You will earn loyalty points if you played for 2+ hours.')) {
      try {
        const response = await reservationsService.complete(id);
        const pointsAwarded = response.data.pointsAwarded || 0;
        let message = 'Reservation completed successfully!';
        if (pointsAwarded > 0) {
          message += ` 🎉 You earned ${pointsAwarded} loyalty points!`;
        }
        setSuccess(message);
        fetchReservations();
        
        // Update user loyalty points in localStorage
        if (response.data.newLoyaltyPoints !== undefined) {
          const userData = localStorage.getItem('user');
          if (userData) {
            const updatedUser = JSON.parse(userData);
            updatedUser.loyaltyPoints = response.data.newLoyaltyPoints;
            localStorage.setItem('user', JSON.stringify(updatedUser));
            refreshUser();
          }
        }
      } catch (error) {
        setError(error.response?.data?.message || 'Failed to complete reservation');
      }
    }
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
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div style={{ animation: 'fadeInUp 0.6s ease-out' }}>
              <h1 className="fw-bold mb-2" style={{ fontSize: '2.5rem' }}>My Reservations</h1>
              <p className="text-secondary" style={{ fontSize: '1.1rem' }}>Manage your gaming sessions</p>
            </div>
            <Button variant="primary" onClick={() => setShowModal(true)}>
              + New Reservation
            </Button>
          </div>
        </Col>
      </Row>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert variant="success" dismissible onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      <Row>
        {reservations.length === 0 ? (
          <Col>
            <Card className="bg-dark border-secondary text-center py-5">
              <Card.Body>
                <p className="text-secondary">No reservations yet</p>
                <Button variant="primary" onClick={() => setShowModal(true)}>
                  Create Your First Reservation
                </Button>
              </Card.Body>
            </Card>
          </Col>
        ) : (
          reservations.map((reservation, index) => (
            <Col md={6} key={reservation.id} className="mb-3">
              <Card className="bg-dark border-secondary reservation-item animate-card" style={{ animationDelay: `${index * 0.1}s` }}>
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div>
                      <h5 className="text-white">{reservation.gamingStationName}</h5>
                      <p className="text-secondary mb-0 small">
                        {new Date(reservation.startTime).toLocaleString()} -{' '}
                        {new Date(reservation.endTime).toLocaleString()}
                      </p>
                    </div>
                    <Badge
                      bg={
                        reservation.status === 'Confirmed'
                          ? 'success'
                          : reservation.status === 'Cancelled'
                          ? 'danger'
                          : 'secondary'
                      }
                    >
                      {reservation.status}
                    </Badge>
                  </div>
                  <p className="mb-2 text-white">
                    <strong className="text-white">Total Price:</strong> <span className="text-white">${reservation.totalPrice.toFixed(2)}</span>
                  </p>
                  <div className="d-flex gap-2">
                    {reservation.status !== 'Cancelled' && reservation.status !== 'Completed' && (
                      <>
                        <Button
                          variant="outline-success"
                          size="sm"
                          onClick={() => handleComplete(reservation.id)}
                        >
                          ✓ Complete
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleCancel(reservation.id)}
                        >
                          Cancel
                        </Button>
                      </>
                    )}
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))
        )}
      </Row>

      <Modal 
        show={showModal} 
        onHide={() => setShowModal(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton className="bg-dark border-secondary" style={{ borderBottom: '2px solid #58a6ff' }}>
          <Modal.Title className="text-white d-flex align-items-center">
            <span style={{ fontSize: '1.5rem', marginRight: '10px' }}>🎮</span>
            Create New Reservation
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-dark" style={{ padding: '2rem' }}>
          {error && (
            <Alert variant="danger" dismissible onClose={() => setError('')} className="mb-4">
              {error}
            </Alert>
          )}
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6} className="mb-4">
                <Form.Group>
                  <Form.Label className="text-white d-flex align-items-center mb-2" style={{ fontWeight: '500' }}>
                    <span style={{ marginRight: '8px' }}>🏪</span>
                    Select Shop
                    <span className="text-secondary ms-2" style={{ fontSize: '0.85rem', fontWeight: 'normal' }}>(Optional)</span>
                  </Form.Label>
                  <Form.Select
                    value={selectedShop}
                    onChange={(e) => {
                      setSelectedShop(e.target.value);
                      setFormData({ ...formData, gamingStationId: '' });
                      setSelectedStationDetails(null);
                      setEstimatedPrice(0);
                    }}
                    className="bg-dark text-white border-secondary"
                    style={{ 
                      color: '#ffffff',
                      padding: '0.75rem',
                      borderRadius: '6px',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <option value="" style={{ backgroundColor: '#0a0a0a', color: '#ffffff' }}>All Shops</option>
                    {shops.map((shop) => (
                      <option key={shop.id} value={shop.id} style={{ backgroundColor: '#0a0a0a', color: '#ffffff' }}>
                        {shop.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6} className="mb-4">
                <Form.Group>
                  <Form.Label className="text-white d-flex align-items-center mb-2" style={{ fontWeight: '500' }}>
                    <span style={{ marginRight: '8px' }}>🎯</span>
                    Gaming Station
                  </Form.Label>
                  {allStations.length === 0 ? (
                    <Alert variant="info" className="small mb-0" style={{ padding: '0.75rem' }}>
                      <Spinner animation="border" size="sm" className="me-2" />
                      Loading stations...
                    </Alert>
                  ) : (
                    <Form.Select
                      value={formData.gamingStationId}
                      onChange={(e) => {
                        const stationId = e.target.value;
                        const station = allStations.find(s => s.id.toString() === stationId);
                        setFormData({ ...formData, gamingStationId: stationId });
                        setSelectedStationDetails(station || null);
                        calculatePrice(station, formData.startTime, formData.endTime);
                      }}
                      required
                      className="bg-dark text-white border-secondary"
                      style={{ 
                        color: '#ffffff',
                        padding: '0.75rem',
                        borderRadius: '6px',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      <option value="" style={{ backgroundColor: '#0a0a0a', color: '#ffffff' }}>Choose a gaming station...</option>
                      {allStations.map((station) => (
                        <option 
                          key={station.id} 
                          value={station.id}
                          style={{ backgroundColor: '#0a0a0a', color: '#ffffff' }}
                        >
                          {station.name} ({station.type === 0 ? 'PC' : station.type === 1 ? 'PlayStation' : 'Xbox'}) - ${station.hourlyRate}/hour - {station.shopName}
                        </option>
                      ))}
                    </Form.Select>
                  )}
                  {selectedStationDetails && (
                    <div 
                      className="mt-3 p-3 rounded" 
                      style={{ 
                        background: 'linear-gradient(135deg, rgba(88, 166, 255, 0.15) 0%, rgba(88, 166, 255, 0.05) 100%)',
                        border: '2px solid #58a6ff',
                        animation: 'fadeIn 0.3s ease-in'
                      }}
                    >
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <div>
                          <strong className="text-white" style={{ fontSize: '1.1rem' }}>{selectedStationDetails.name}</strong>
                          <Badge bg="info" className="ms-2">${selectedStationDetails.hourlyRate}/hour</Badge>
                        </div>
                        <Badge bg="secondary">
                          {selectedStationDetails.type === 0 ? '🖥️ PC' : selectedStationDetails.type === 1 ? '🎮 PlayStation' : '🎮 Xbox'}
                        </Badge>
                      </div>
                      {selectedStationDetails.specifications && (
                        <div className="mb-2">
                          <p className="text-white small mb-1" style={{ fontSize: '0.85rem', fontWeight: '500' }}>Specifications:</p>
                          <p className="text-secondary small mb-0" style={{ fontSize: '0.85rem', lineHeight: '1.5' }}>
                            {selectedStationDetails.specifications}
                          </p>
                        </div>
                      )}
                      <div className="d-flex align-items-center mt-2 pt-2" style={{ borderTop: '1px solid rgba(88, 166, 255, 0.2)' }}>
                        <span className="text-primary me-2">📍</span>
                        <span className="text-secondary small">{selectedStationDetails.shopName}</span>
                      </div>
                    </div>
                  )}
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6} className="mb-4">
                <Form.Group>
                  <Form.Label className="text-white d-flex align-items-center mb-2" style={{ fontWeight: '500' }}>
                    <span style={{ marginRight: '8px' }}>🕐</span>
                    Start Time
                  </Form.Label>
                  <Form.Control
                    type="datetime-local"
                    value={formData.startTime}
                    onChange={(e) => {
                      setFormData({ ...formData, startTime: e.target.value });
                      calculatePrice(selectedStationDetails, e.target.value, formData.endTime);
                    }}
                    required
                    className="bg-dark text-white border-secondary"
                    style={{ 
                      color: '#ffffff',
                      padding: '0.75rem',
                      borderRadius: '6px',
                      transition: 'all 0.3s ease'
                    }}
                    min={new Date().toISOString().slice(0, 16)}
                  />
                </Form.Group>
              </Col>
              <Col md={6} className="mb-4">
                <Form.Group>
                  <Form.Label className="text-white d-flex align-items-center mb-2" style={{ fontWeight: '500' }}>
                    <span style={{ marginRight: '8px' }}>🕑</span>
                    End Time
                  </Form.Label>
                  <Form.Control
                    type="datetime-local"
                    value={formData.endTime}
                    onChange={(e) => {
                      setFormData({ ...formData, endTime: e.target.value });
                      calculatePrice(selectedStationDetails, formData.startTime, e.target.value);
                    }}
                    required
                    className="bg-dark text-white border-secondary"
                    style={{ 
                      color: '#ffffff',
                      padding: '0.75rem',
                      borderRadius: '6px',
                      transition: 'all 0.3s ease'
                    }}
                    min={formData.startTime || new Date().toISOString().slice(0, 16)}
                  />
                </Form.Group>
              </Col>
            </Row>

            {user && (
              <div className="mb-4 p-3 rounded" style={{ 
                background: 'linear-gradient(135deg, rgba(210, 153, 34, 0.1) 0%, rgba(210, 153, 34, 0.05) 100%)',
                border: '1px solid rgba(210, 153, 34, 0.3)'
              }}>
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <p className="text-warning small mb-1 fw-bold">⭐ Your Loyalty Points</p>
                    <h5 className="text-warning mb-0">{user.loyaltyPoints || 0} points</h5>
                  </div>
                  <div className="text-end">
                    <p className="text-secondary small mb-0" style={{ fontSize: '0.75rem' }}>
                      Play 2+ hours = 10 points
                      <br />
                      50 points = 2 hours FREE
                    </p>
                  </div>
                </div>
              </div>
            )}

            <Form.Group className="mb-4">
              <Form.Label className="text-white d-flex align-items-center mb-2" style={{ fontWeight: '500' }}>
                <span style={{ marginRight: '8px' }}>📝</span>
                Notes
                <span className="text-secondary ms-2" style={{ fontSize: '0.85rem', fontWeight: 'normal' }}>(Optional)</span>
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="bg-dark text-white border-secondary"
                style={{ 
                  color: '#ffffff',
                  padding: '0.75rem',
                  borderRadius: '6px',
                  resize: 'vertical',
                  transition: 'all 0.3s ease'
                }}
                placeholder="Add any special requests or notes..."
              />
            </Form.Group>

            {estimatedPrice >= 0 && selectedStationDetails && formData.startTime && formData.endTime && (
              <div className="mb-4 p-3 rounded" style={{ 
                background: freeHoursApplied 
                  ? 'linear-gradient(135deg, rgba(63, 185, 80, 0.15) 0%, rgba(63, 185, 80, 0.05) 100%)'
                  : 'linear-gradient(135deg, rgba(88, 166, 255, 0.1) 0%, rgba(88, 166, 255, 0.05) 100%)',
                border: freeHoursApplied 
                  ? '2px solid rgba(63, 185, 80, 0.5)'
                  : '1px solid rgba(88, 166, 255, 0.3)'
              }}>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <p className="text-secondary small mb-1">Estimated Total</p>
                    <h4 className={freeHoursApplied ? "text-success" : "text-primary"} style={{ fontWeight: 'bold' }}>
                      ${estimatedPrice.toFixed(2)}
                      {freeHoursApplied && <span className="ms-2">🎉 FREE!</span>}
                    </h4>
                    {formData.startTime && formData.endTime && (
                      <div className="mt-2">
                        <p className="text-secondary small mb-1">
                          {((new Date(formData.endTime) - new Date(formData.startTime)) / (1000 * 60 * 60)).toFixed(1)} hours × ${selectedStationDetails.hourlyRate}/hour
                        </p>
                        {freeHoursApplied && (
                          <p className="text-success small mb-0 fw-bold">
                            ✨ 2 hours FREE applied! (50 loyalty points will be deducted)
                          </p>
                        )}
                        {!freeHoursApplied && user?.loyaltyPoints >= 50 && (
                          <p className="text-warning small mb-0">
                            💡 You have {user.loyaltyPoints} points! Reserve 2+ hours to get 2 hours free.
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="text-end">
                    <span style={{ fontSize: '2rem' }}>{freeHoursApplied ? '🎁' : '💰'}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="d-grid gap-2 mt-4">
              <Button 
                variant="primary" 
                type="submit" 
                size="lg"
                style={{
                  padding: '0.75rem',
                  borderRadius: '6px',
                  fontWeight: '600',
                  fontSize: '1rem',
                  boxShadow: '0 4px 6px rgba(88, 166, 255, 0.3)',
                  transition: 'all 0.3s ease'
                }}
              >
                ✨ Create Reservation
              </Button>
              <Button 
                variant="outline-secondary" 
                onClick={() => setShowModal(false)}
                style={{
                  padding: '0.5rem',
                  borderRadius: '6px',
                  borderColor: '#6e7681'
                }}
              >
                Cancel
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default Reservations;

