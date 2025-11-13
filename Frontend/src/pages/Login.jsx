import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, Alert, InputGroup } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password);
    if (result.success) {
      // Redirect admin to admin dashboard, regular users to dashboard
      const userData = result.user;
      if (userData?.roles?.includes('Admin')) {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
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
                <h2 className="fw-bold">Login to GameHub</h2>
                <p className="text-secondary">Welcome back!</p>
              </div>
              {error && <Alert variant="danger">{error}</Alert>}
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label className="text-white">Email</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-dark text-white border-secondary"
                    style={{ color: '#ffffff' }}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label className="text-white">Password</Form.Label>
                  <InputGroup>
                    <Form.Control
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="bg-dark text-white border-secondary"
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
                <Button
                  variant="primary"
                  type="submit"
                  className="w-100"
                  disabled={loading}
                >
                  {loading ? 'Logging in...' : 'Login'}
                </Button>
              </Form>
              <div className="text-center mt-3">
                <p className="text-secondary">
                  Don't have an account?{' '}
                  <a href="/register" className="text-primary">
                    Sign up here
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

export default Login;

