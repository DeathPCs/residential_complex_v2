import React, { useState, useContext } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Link,
  IconButton,
  InputAdornment,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import Loading from '../../components/common/Loading';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [formAlert, setFormAlert] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const validateForm = () => {
    const errors = {};
    let alertMessage = '';

    if (!formData.email.trim()) {
      errors.email = 'El email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'El email no es válido';
    } else if (formData.email.length > 255) {
      errors.email = 'El email no puede exceder 255 caracteres';
    }

    if (!formData.password.trim()) {
      errors.password = 'La contraseña es requerida';
    } else if (formData.password.length > 50) {
      errors.password = 'La contraseña no puede exceder 50 caracteres';
    }

    setFormErrors(errors);

    // Crear mensaje de alerta con todos los campos faltantes
    const missingFields = [];
    if (errors.email) missingFields.push('Email');
    if (errors.password) missingFields.push('Contraseña');

    if (missingFields.length > 0) {
      alertMessage = `Por favor, completa los siguientes campos: ${missingFields.join(', ')}.`;
    } else if (Object.keys(errors).length > 0) {
      const errorMessages = Object.values(errors).filter(msg => !msg.includes('requerido'));
      if (errorMessages.length > 0) {
        alertMessage = `Corrige los siguientes errores: ${errorMessages.join(', ')}.`;
      }
    }

    setFormAlert(alertMessage);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let processedValue = value;

    // Aplicar límites según el campo
    if (name === 'email') {
      processedValue = value.slice(0, 255);
    } else if (name === 'password') {
      processedValue = value.slice(0, 50);
    }

    setFormData({ ...formData, [name]: processedValue });

    // Limpiar errores del campo cuando el usuario empiece a escribir
    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: '' });
    }
    if (formAlert) {
      setFormAlert('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');
    setFormAlert('');

    try {
      await login(formData.email, formData.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundImage: 'linear-gradient(to top, rgba(0,0,0,0.65), rgba(0,0,0,0.25)), url(https://tecnne.com/wp-content/uploads/2022/11/ACDF-Architecture-Joie-de-Vivre-Residential-Building-tecnne.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Container component="main" maxWidth="sm">
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            px: { xs: 2, sm: 4 },
            position: 'relative',
          }}
        >
          <Paper
            elevation={4}
            sx={{
              padding: { xs: 4, sm: 6 },
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              width: '100%',
              borderRadius: 3,
              boxShadow: 6,
              position: 'relative',
              zIndex: 2,
            }}
          >
            <Typography
              variant="h4"
              sx={{
                fontWeight: 800,
                fontSize: '3rem',
                color: 'primary.main',
                display: 'flex',
                alignItems: 'center',
                userSelect: 'none',
              }}
            >
              Nexo
              <Box
                component="img"
                src="/logo.png"
                alt="logo"
                sx={{
                  width: 45,
                  height: 45,
                  mx: 0.3,
                  transform: 'translateY(-1px)'
                }}
              />
              Home
            </Typography>
            <Typography color="primary.main" component="h1" variant="h4" gutterBottom sx={{ fontWeight: 700, letterSpacing: '0.03em' }}>
              Iniciar Sesión
            </Typography>

            {error && (
              <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
                {error}
              </Alert>
            )}

            {formAlert && (
              <Alert severity="warning" sx={{ width: '100%', mb: 2 }}>
                {formAlert}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3, width: '100%' }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Correo Electrónico"
                name="email"
                type="email"
                autoComplete="email"
                autoFocus
                value={formData.email}
                onChange={handleChange}
                error={!!formErrors.email}
                helperText={formErrors.email}
                inputProps={{ maxLength: 255 }}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Contraseña"
                type={showPassword ? 'text' : 'password'}
                id="password"
                autoComplete="current-password"
                value={formData.password}
                onChange={handleChange}
                error={!!formErrors.password}
                helperText={formErrors.password}
                inputProps={{ maxLength: 50 }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{
                  mt: 4,
                  mb: 3,
                  fontWeight: 600,
                  borderRadius: '12px',
                  textTransform: 'none',
                  py: 1.1,
                  transition: 'background-color 0.3s ease',
                  '&:hover': {
                    backgroundColor: '#003354',
                  },
                }}
                disabled={loading}
              >
                {loading ? 'Iniciando...' : 'Iniciar Sesión'}
              </Button>
              <Box sx={{ textAlign: 'center' }}>
                <Link href="/register" variant="body2" sx={{ fontWeight: 500 }}>
                  ¿No tienes cuenta? Regístrate
                </Link>
              </Box>
              <Box sx={{ textAlign: 'center', mt: 3 }}>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => window.location.href = '/'}
                  sx={{
                    fontWeight: 600,
                    borderRadius: '12px',
                    textTransform: 'none',
                    py: 1,
                    px: 3,
                    transition: 'background-color 0.3s ease',
                    '&:hover': {
                      backgroundColor: '#003354',
                      color: 'primary.main',
                    },
                  }}
                >
                  Volver al inicio
                </Button>
              </Box>
            </Box>
          </Paper>

          {/* Pantalla de carga durante login */}
          {loading && <Loading message="Iniciando sesión..." fullScreen />}
        </Box>
      </Container>
    </Box>
  );
};

export default Login;
