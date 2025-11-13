import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, Alert, InputGroup } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    dateOfBirth: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await register({
      ...formData,
      dateOfBirth: new Date(formData.dateOfBirth).toISOString(),
    });

    if (result.success) {
      navigate('/login');
    } else {
      setError(result.message);
    }
    setLoading(false);
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={6} lg={5}>
          <Card className="bg-dark border-secondary">
            <Card.Body className="p-4">
              <div className="text-center mb-4">
                <h2 className="fw-bold">Join GameHub</h2>
                <p className="text-secondary">Create your account and start gaming!</p>
              </div>
              {error && <Alert variant="danger">{error}</Alert>}
              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="text-white">First Name</Form.Label>
                      <Form.Control
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        required
                        className="bg-dark text-white border-secondary"
                        placeholder="Enter your first name"
                        style={{ color: '#ffffff' }}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="text-white">Last Name</Form.Label>
                      <Form.Control
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        required
                        className="bg-dark text-white border-secondary"
                        placeholder="Enter your last name"
                        style={{ color: '#ffffff' }}
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <Form.Group className="mb-3">
                  <Form.Label className="text-white">Email</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="bg-dark text-white border-secondary"
                    placeholder="Enter your email"
                    style={{ color: '#ffffff' }}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label className="text-white">Password</Form.Label>
                  <InputGroup>
                    <Form.Control
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      minLength={6}
                      className="bg-dark text-white border-secondary"
                      placeholder="Enter your password (min 6 characters)"
                      style={{ color: '#ffffff' }}
                    />
                    <Button
                      variant="outline-secondary"
                      onClick={() => setShowPassword(!showPassword)}
                      className="bg-dark border-secondary"
                      style={{ borderLeft: 'none' }}
                    >
                      {showPassword ? '🙈' : '👁️'}
                    </Button>
                  </InputGroup>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label className="text-white">Date of Birth</Form.Label>
                  <Form.Control
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    required
                    className="bg-dark text-white border-secondary"
                    style={{ color: '#ffffff' }}
                  />
                </Form.Group>
                <Button
                  variant="primary"
                  type="submit"
                  className="w-100"
                  disabled={loading}
                >
                  {loading ? 'Creating account...' : 'Sign Up'}
                </Button>
              </Form>
              <div className="text-center mt-3">
                <p className="text-secondary">
                  Already have an account?{' '}
                  <a href="/login" className="text-primary">
                    Login here
                  </a>
                </p>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Register;

