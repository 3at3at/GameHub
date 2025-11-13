import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Modal, Form, Alert, Badge, Spinner } from 'react-bootstrap';
import { useSearchParams } from 'react-router-dom';
import { adminService } from '../services/api';
import { useAuth } from '../context/AuthContext';

const AdminDashboard = () => {
  const { isAdmin } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'shops');
  const [users, setUsers] = useState([]);
  const [tournaments, setTournaments] = useState([]);
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTournamentModal, setShowTournamentModal] = useState(false);
  const [showShopModal, setShowShopModal] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [imagePreview, setImagePreview] = useState(null);

  const [tournamentFormData, setTournamentFormData] = useState({
    name: '',
    game: '',
    description: '',
    shopId: '',
    startDate: '',
    registrationDeadline: '',
    maxParticipants: '',
    entryFee: '',
    prizePool: '',
    imageUrl: ''
  });

  const [shopFormData, setShopFormData] = useState({
    name: '',
    address: '',
    city: '',
    country: '',
    phoneNumber: '',
    email: '',
    hourlyRate: '',
    isActive: true
  });

  useEffect(() => {
    if (!isAdmin()) {
      window.location.href = '/';
      return;
    }
    
    // Check URL params on mount
    const tabFromUrl = searchParams.get('tab');
    if (tabFromUrl && ['shops', 'tournaments', 'users'].includes(tabFromUrl)) {
      setActiveTab(tabFromUrl);
    }
  }, []);

  useEffect(() => {
    if (!isAdmin()) {
      return;
    }
    
    // Listen for tab changes from navbar
    const handleTabChange = (event) => {
      const newTab = event.detail;
      setActiveTab(newTab);
      setSearchParams({ tab: newTab });
    };
    
    window.addEventListener('adminTabChange', handleTabChange);
    
    fetchData();
    
    return () => {
      window.removeEventListener('adminTabChange', handleTabChange);
    };
  }, [activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      if (activeTab === 'users') {
        const response = await adminService.getUsers();
        setUsers(response.data);
      } else if (activeTab === 'tournaments') {
        const response = await adminService.getTournaments();
        setTournaments(response.data);
      } else if (activeTab === 'shops') {
        const response = await adminService.getShops();
        setShops(response.data);
      }
      // Always load shops for tournament creation dropdown
      if (shops.length === 0) {
        const shopsResponse = await adminService.getShops();
        setShops(shopsResponse.data);
      }
    } catch (error) {
      setError('Failed to load data: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTournamentSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', tournamentFormData.name);
      formDataToSend.append('game', tournamentFormData.game);
      formDataToSend.append('description', tournamentFormData.description);
      formDataToSend.append('shopId', tournamentFormData.shopId);
      formDataToSend.append('startDate', new Date(tournamentFormData.startDate).toISOString());
      formDataToSend.append('registrationDeadline', new Date(tournamentFormData.registrationDeadline).toISOString());
      formDataToSend.append('maxParticipants', tournamentFormData.maxParticipants);
      formDataToSend.append('entryFee', tournamentFormData.entryFee);
      formDataToSend.append('prizePool', tournamentFormData.prizePool);
      
      const imageInput = document.getElementById('tournamentImage');
      if (imageInput?.files[0]) {
        formDataToSend.append('imageFile', imageInput.files[0]);
      } else if (tournamentFormData.imageUrl) {
        formDataToSend.append('imageUrl', tournamentFormData.imageUrl);
      }

      await adminService.createTournament(formDataToSend);
      setSuccess('Tournament created successfully!');
      setShowTournamentModal(false);
      setTournamentFormData({
        name: '',
        game: '',
        description: '',
        shopId: '',
        startDate: '',
        registrationDeadline: '',
        maxParticipants: '',
        entryFee: '',
        prizePool: '',
        imageUrl: ''
      });
      setImagePreview(null);
      fetchData();
    } catch (error) {
      setError('Failed to create tournament: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleShopSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await adminService.createShop(shopFormData);
      setSuccess('Shop created successfully!');
      setShowShopModal(false);
      setShopFormData({
        name: '',
        address: '',
        city: '',
        country: '',
        phoneNumber: '',
        email: '',
        hourlyRate: '',
        isActive: true
      });
      fetchData();
    } catch (error) {
      setError('Failed to create shop: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDeleteTournament = async (id) => {
    if (!window.confirm('Are you sure you want to delete this tournament?')) {
      return;
    }

    try {
      await adminService.deleteTournament(id);
      setSuccess('Tournament deleted successfully!');
      fetchData();
    } catch (error) {
      setError('Failed to delete tournament: ' + (error.response?.data?.message || error.message));
    }
  };

  if (!isAdmin()) {
    return null;
  }

  return (
    <Container className="py-5">
      <Row className="mb-4">
        <Col>
          <h1 className="fw-bold mb-2" style={{ fontSize: '2.5rem' }}>
            🛡️ Admin Dashboard
          </h1>
          <p className="text-secondary" style={{ fontSize: '1.1rem' }}>
            Manage shops, tournaments, and users
          </p>
        </Col>
        <Col xs="auto">
          {activeTab === 'tournaments' && (
            <Button
              variant="primary"
              onClick={() => setShowTournamentModal(true)}
              style={{
                borderRadius: '6px',
                padding: '0.75rem 1.5rem',
                fontWeight: '600'
              }}
            >
              + Create Tournament
            </Button>
          )}
          {activeTab === 'shops' && (
            <Button
              variant="primary"
              onClick={() => setShowShopModal(true)}
              style={{
                borderRadius: '6px',
                padding: '0.75rem 1.5rem',
                fontWeight: '600'
              }}
            >
              + Add Shop
            </Button>
          )}
        </Col>
      </Row>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError('')} className="mb-4">
          {error}
        </Alert>
      )}

      {success && (
        <Alert variant="success" dismissible onClose={() => setSuccess('')} className="mb-4">
          {success}
        </Alert>
      )}

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="text-secondary mt-3">Loading...</p>
        </div>
      ) : (
        <>
          {activeTab === 'shops' && (
            <Row>
              {shops.length === 0 ? (
                <Col>
                  <Card className="bg-dark border-secondary text-center py-5">
                    <Card.Body>
                      <p className="text-secondary mb-0">No shops found</p>
                    </Card.Body>
                  </Card>
                </Col>
              ) : (
                shops.map((shop, index) => (
                  <Col md={6} lg={4} key={shop.id} className="mb-4">
                    <Card className="bg-dark border-secondary h-100 animate-card" style={{ animationDelay: `${index * 0.1}s` }}>
                      <Card.Body>
                        <Card.Title className="text-primary mb-3" style={{ fontSize: '1.2rem' }}>
                          {shop.name}
                        </Card.Title>
                        <Card.Text className="text-secondary small mb-2">
                          <strong className="text-white">📍</strong> {shop.address}, {shop.city}, {shop.country}<br />
                          <strong className="text-white">📞</strong> {shop.phoneNumber}<br />
                          <strong className="text-white">✉️</strong> {shop.email}<br />
                          <strong className="text-white">💰</strong> ${shop.hourlyRate}/hour<br />
                          <Badge bg={shop.isActive ? 'success' : 'secondary'} className="mt-2">
                            {shop.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </Card.Text>
                      </Card.Body>
                    </Card>
                  </Col>
                ))
              )}
            </Row>
          )}

          {activeTab === 'tournaments' && (
            <Row>
              {tournaments.length === 0 ? (
                <Col>
                  <Card className="bg-dark border-secondary text-center py-5">
                    <Card.Body>
                      <p className="text-secondary mb-0">No tournaments found</p>
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

                  // Use uploaded image if available, otherwise use game image
                  const imageUrl = tournament.imageUrl 
                    ? (tournament.imageUrl.startsWith('http') ? tournament.imageUrl : `http://localhost:5041${tournament.imageUrl}`)
                    : getGameImage(tournament.game);

                  return (
                    <Col md={6} lg={4} key={tournament.id} className="mb-4">
                      <Card className="bg-dark border-secondary h-100 animate-card" style={{ animationDelay: `${index * 0.1}s` }}>
                        <div style={{ height: '150px', overflow: 'hidden', position: 'relative' }}>
                          <img
                            src={imageUrl}
                            alt={tournament.name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={(e) => {
                              e.target.src = 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&h=600&fit=crop';
                            }}
                          />
                        </div>
                        <Card.Body>
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <Card.Title className="text-primary mb-0" style={{ fontSize: '1.1rem' }}>
                              {tournament.name}
                            </Card.Title>
                            <Badge bg="info">{tournament.status}</Badge>
                          </div>
                          <Card.Text className="text-secondary small mb-2">
                            <strong className="text-white">Game:</strong> {tournament.game}<br />
                            <strong className="text-white">Shop:</strong> {tournament.shopName}<br />
                            <strong className="text-white">Participants:</strong> {tournament.currentParticipants}/{tournament.maxParticipants}<br />
                            <strong className="text-white">Entry Fee:</strong> ${tournament.entryFee} | <strong className="text-white">Prize:</strong> ${tournament.prizePool}
                          </Card.Text>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleDeleteTournament(tournament.id)}
                            className="w-100"
                          >
                            🗑️ Delete Tournament
                          </Button>
                        </Card.Body>
                      </Card>
                    </Col>
                  );
                })
              )}
            </Row>
          )}

          {activeTab === 'users' && (
            <Card className="bg-dark border-secondary animate-card">
              <Card.Header className="bg-dark border-secondary">
                <h5 className="mb-0 text-white">Registered Users</h5>
              </Card.Header>
              <Card.Body>
                <Table striped bordered hover variant="dark" responsive>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Loyalty Points</th>
                      <th>Roles</th>
                      <th>Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td className="text-white">{user.firstName} {user.lastName}</td>
                        <td className="text-white">{user.email}</td>
                        <td className="text-warning">{user.loyaltyPoints || 0}</td>
                        <td>
                          {user.roles && user.roles.length > 0 ? (
                            user.roles.map((role, idx) => (
                              <Badge key={idx} bg={role === 'Admin' ? 'danger' : 'primary'} className="me-1">{role}</Badge>
                            ))
                          ) : (
                            <Badge bg="secondary">User</Badge>
                          )}
                        </td>
                        <td className="text-secondary">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          )}
        </>
      )}

      {/* Create Tournament Modal */}
      <Modal
        show={showTournamentModal}
        onHide={() => {
          setShowTournamentModal(false);
          setError('');
          setImagePreview(null);
        }}
        size="lg"
        centered
      >
        <Modal.Header closeButton className="bg-dark border-secondary" style={{ borderBottom: '2px solid #58a6ff' }}>
          <Modal.Title className="text-white d-flex align-items-center">
            <span style={{ fontSize: '1.5rem', marginRight: '10px' }}>🏆</span>
            Create New Tournament
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-dark" style={{ padding: '2rem' }}>
          <Form onSubmit={handleTournamentSubmit}>
            <Row>
              <Col md={6} className="mb-3">
                <Form.Label className="text-white">Tournament Name *</Form.Label>
                <Form.Control
                  type="text"
                  value={tournamentFormData.name}
                  onChange={(e) => setTournamentFormData({ ...tournamentFormData, name: e.target.value })}
                  required
                  className="bg-dark text-white border-secondary"
                  style={{ color: '#ffffff' }}
                />
              </Col>
              <Col md={6} className="mb-3">
                <Form.Label className="text-white">Game *</Form.Label>
                <Form.Control
                  type="text"
                  value={tournamentFormData.game}
                  onChange={(e) => setTournamentFormData({ ...tournamentFormData, game: e.target.value })}
                  required
                  className="bg-dark text-white border-secondary"
                  style={{ color: '#ffffff' }}
                />
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label className="text-white">Description *</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={tournamentFormData.description}
                onChange={(e) => setTournamentFormData({ ...tournamentFormData, description: e.target.value })}
                required
                className="bg-dark text-white border-secondary"
                style={{ color: '#ffffff' }}
              />
            </Form.Group>

            <Row>
              <Col md={6} className="mb-3">
                <Form.Label className="text-white">Shop *</Form.Label>
                <Form.Select
                  value={tournamentFormData.shopId}
                  onChange={(e) => setTournamentFormData({ ...tournamentFormData, shopId: e.target.value })}
                  required
                  className="bg-dark text-white border-secondary"
                  style={{ color: '#ffffff' }}
                >
                  <option value="" style={{ backgroundColor: '#0a0a0a', color: '#ffffff' }}>Select a shop...</option>
                  {shops.map((shop) => (
                    <option key={shop.id} value={shop.id} style={{ backgroundColor: '#0a0a0a', color: '#ffffff' }}>
                      {shop.name}
                    </option>
                  ))}
                </Form.Select>
              </Col>
              <Col md={6} className="mb-3">
                <Form.Label className="text-white">Max Participants *</Form.Label>
                <Form.Control
                  type="number"
                  min="1"
                  value={tournamentFormData.maxParticipants}
                  onChange={(e) => setTournamentFormData({ ...tournamentFormData, maxParticipants: e.target.value })}
                  required
                  className="bg-dark text-white border-secondary"
                  style={{ color: '#ffffff' }}
                />
              </Col>
            </Row>

            <Row>
              <Col md={6} className="mb-3">
                <Form.Label className="text-white">Start Date *</Form.Label>
                <Form.Control
                  type="datetime-local"
                  value={tournamentFormData.startDate}
                  onChange={(e) => setTournamentFormData({ ...tournamentFormData, startDate: e.target.value })}
                  required
                  className="bg-dark text-white border-secondary"
                  style={{ color: '#ffffff' }}
                />
              </Col>
              <Col md={6} className="mb-3">
                <Form.Label className="text-white">Registration Deadline *</Form.Label>
                <Form.Control
                  type="datetime-local"
                  value={tournamentFormData.registrationDeadline}
                  onChange={(e) => setTournamentFormData({ ...tournamentFormData, registrationDeadline: e.target.value })}
                  required
                  className="bg-dark text-white border-secondary"
                  style={{ color: '#ffffff' }}
                />
              </Col>
            </Row>

            <Row>
              <Col md={6} className="mb-3">
                <Form.Label className="text-white">Entry Fee ($) *</Form.Label>
                <Form.Control
                  type="number"
                  step="0.01"
                  min="0"
                  value={tournamentFormData.entryFee}
                  onChange={(e) => setTournamentFormData({ ...tournamentFormData, entryFee: e.target.value })}
                  required
                  className="bg-dark text-white border-secondary"
                  style={{ color: '#ffffff' }}
                />
              </Col>
              <Col md={6} className="mb-3">
                <Form.Label className="text-white">Prize Pool ($) *</Form.Label>
                <Form.Control
                  type="number"
                  step="0.01"
                  min="0"
                  value={tournamentFormData.prizePool}
                  onChange={(e) => setTournamentFormData({ ...tournamentFormData, prizePool: e.target.value })}
                  required
                  className="bg-dark text-white border-secondary"
                  style={{ color: '#ffffff' }}
                />
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label className="text-white">Tournament Image</Form.Label>
              <Form.Control
                id="tournamentImage"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="bg-dark text-white border-secondary"
              />
              <Form.Text className="text-secondary">Upload an image from your PC (max 5MB)</Form.Text>
              {imagePreview && (
                <div className="mt-2">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '6px' }}
                  />
                </div>
              )}
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="text-white">Or Image URL</Form.Label>
              <Form.Control
                type="url"
                value={tournamentFormData.imageUrl}
                onChange={(e) => setTournamentFormData({ ...tournamentFormData, imageUrl: e.target.value })}
                placeholder="https://example.com/image.jpg"
                className="bg-dark text-white border-secondary"
                style={{ color: '#ffffff' }}
              />
            </Form.Group>

            <div className="d-grid gap-2 mt-4">
              <Button
                variant="primary"
                type="submit"
                size="lg"
                style={{
                  padding: '0.75rem',
                  borderRadius: '6px',
                  fontWeight: '600'
                }}
              >
                ✨ Create Tournament
              </Button>
              <Button
                variant="outline-secondary"
                onClick={() => {
                  setShowTournamentModal(false);
                  setError('');
                  setImagePreview(null);
                }}
              >
                Cancel
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Create Shop Modal */}
      <Modal
        show={showShopModal}
        onHide={() => {
          setShowShopModal(false);
          setError('');
        }}
        size="lg"
        centered
      >
        <Modal.Header closeButton className="bg-dark border-secondary" style={{ borderBottom: '2px solid #58a6ff' }}>
          <Modal.Title className="text-white d-flex align-items-center">
            <span style={{ fontSize: '1.5rem', marginRight: '10px' }}>🏪</span>
            Add New Shop
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-dark" style={{ padding: '2rem' }}>
          <Form onSubmit={handleShopSubmit}>
            <Row>
              <Col md={6} className="mb-3">
                <Form.Label className="text-white">Shop Name *</Form.Label>
                <Form.Control
                  type="text"
                  value={shopFormData.name}
                  onChange={(e) => setShopFormData({ ...shopFormData, name: e.target.value })}
                  required
                  className="bg-dark text-white border-secondary"
                  style={{ color: '#ffffff' }}
                />
              </Col>
              <Col md={6} className="mb-3">
                <Form.Label className="text-white">Email *</Form.Label>
                <Form.Control
                  type="email"
                  value={shopFormData.email}
                  onChange={(e) => setShopFormData({ ...shopFormData, email: e.target.value })}
                  required
                  className="bg-dark text-white border-secondary"
                  style={{ color: '#ffffff' }}
                />
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label className="text-white">Address *</Form.Label>
              <Form.Control
                type="text"
                value={shopFormData.address}
                onChange={(e) => setShopFormData({ ...shopFormData, address: e.target.value })}
                required
                className="bg-dark text-white border-secondary"
                style={{ color: '#ffffff' }}
              />
            </Form.Group>

            <Row>
              <Col md={4} className="mb-3">
                <Form.Label className="text-white">City *</Form.Label>
                <Form.Control
                  type="text"
                  value={shopFormData.city}
                  onChange={(e) => setShopFormData({ ...shopFormData, city: e.target.value })}
                  required
                  className="bg-dark text-white border-secondary"
                  style={{ color: '#ffffff' }}
                />
              </Col>
              <Col md={4} className="mb-3">
                <Form.Label className="text-white">Country *</Form.Label>
                <Form.Control
                  type="text"
                  value={shopFormData.country}
                  onChange={(e) => setShopFormData({ ...shopFormData, country: e.target.value })}
                  required
                  className="bg-dark text-white border-secondary"
                  style={{ color: '#ffffff' }}
                />
              </Col>
              <Col md={4} className="mb-3">
                <Form.Label className="text-white">Phone Number *</Form.Label>
                <Form.Control
                  type="text"
                  value={shopFormData.phoneNumber}
                  onChange={(e) => setShopFormData({ ...shopFormData, phoneNumber: e.target.value })}
                  required
                  className="bg-dark text-white border-secondary"
                  style={{ color: '#ffffff' }}
                />
              </Col>
            </Row>

            <Row>
              <Col md={6} className="mb-3">
                <Form.Label className="text-white">Hourly Rate ($) *</Form.Label>
                <Form.Control
                  type="number"
                  step="0.01"
                  min="0"
                  value={shopFormData.hourlyRate}
                  onChange={(e) => setShopFormData({ ...shopFormData, hourlyRate: e.target.value })}
                  required
                  className="bg-dark text-white border-secondary"
                  style={{ color: '#ffffff' }}
                />
              </Col>
              <Col md={6} className="mb-3">
                <Form.Label className="text-white">Status</Form.Label>
                <Form.Select
                  value={shopFormData.isActive ? 'true' : 'false'}
                  onChange={(e) => setShopFormData({ ...shopFormData, isActive: e.target.value === 'true' })}
                  className="bg-dark text-white border-secondary"
                  style={{ color: '#ffffff' }}
                >
                  <option value="true" style={{ backgroundColor: '#0a0a0a', color: '#ffffff' }}>Active</option>
                  <option value="false" style={{ backgroundColor: '#0a0a0a', color: '#ffffff' }}>Inactive</option>
                </Form.Select>
              </Col>
            </Row>

            <div className="d-grid gap-2 mt-4">
              <Button
                variant="primary"
                type="submit"
                size="lg"
                style={{
                  padding: '0.75rem',
                  borderRadius: '6px',
                  fontWeight: '600'
                }}
              >
                ✨ Add Shop
              </Button>
              <Button
                variant="outline-secondary"
                onClick={() => {
                  setShowShopModal(false);
                  setError('');
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

export default AdminDashboard;
