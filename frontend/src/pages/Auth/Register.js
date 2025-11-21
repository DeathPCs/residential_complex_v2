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
  MenuItem,
  Snackbar,
  IconButton,
  InputAdornment,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import Loading from '../../components/common/Loading';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    cedula: '',
    phone: '',
    role: '',
  });
  const [error, setError] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [formAlert, setFormAlert] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const validateForm = () => {
    const errors = {};
    let alertMessage = '';
    
    if (!formData.name.trim()) {
      errors.name = 'El nombre es requerido';
    } else if (formData.name.trim().length < 2) {
      errors.name = 'El nombre debe tener al menos 2 caracteres';
    } else if (formData.name.trim().length > 100) {
      errors.name = 'El nombre no puede exceder 100 caracteres';
    }
    
    if (!formData.email.trim()) {
      errors.email = 'El email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'El email no es válido';
    } else if (formData.email.length > 255) {
      errors.email = 'El email no puede exceder 255 caracteres';
    }
    
    if (!formData.password.trim()) {
      errors.password = 'La contraseña es requerida';
    } else {
      const password = formData.password;
      const passwordErrors = [];
      
      if (password.length < 8) {
        passwordErrors.push('mínimo 8 caracteres');
      } else if (password.length > 50) {
        passwordErrors.push('máximo 50 caracteres');
      }
      
      if (!/[A-Z]/.test(password)) {
        passwordErrors.push('una letra mayúscula');
      }
      
      if (!/[a-z]/.test(password)) {
        passwordErrors.push('una letra minúscula');
      }
      
      if (!/[0-9]/.test(password)) {
        passwordErrors.push('un número');
      }
      
      if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
        passwordErrors.push('un carácter especial (!@#$%^&*...)');
      }
      
      if (passwordErrors.length > 0) {
        errors.password = `La contraseña debe contener: ${passwordErrors.join(', ')}`;
      }
    }
    
    if (!formData.cedula.trim()) {
      errors.cedula = 'La cédula es requerida';
    } else if (!/^\d{7,10}$/.test(formData.cedula.trim())) {
      errors.cedula = 'La cédula debe tener entre 7 y 10 dígitos';
    }
    
    if (formData.phone && formData.phone.trim() && !/^\d{7,15}$/.test(formData.phone.trim())) {
      errors.phone = 'El teléfono debe tener entre 7 y 15 dígitos';
    }
    
    if (!formData.role) {
      errors.role = 'El rol es requerido';
    }
    
    setFormErrors(errors);
    
    // Crear mensaje de alerta con todos los campos faltantes
    const missingFields = [];
    if (errors.name) missingFields.push('Nombre');
    if (errors.email) missingFields.push('Email');
    if (errors.password) missingFields.push('Contraseña');
    if (errors.cedula) missingFields.push('Cédula');
    if (errors.phone) missingFields.push('Teléfono');
    if (errors.role) missingFields.push('Rol');
    
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
    
    // Aplicar límites y validaciones según el campo
    if (name === 'cedula') {
      processedValue = value.replace(/\D/g, '').slice(0, 10);
    } else if (name === 'phone') {
      processedValue = value.replace(/\D/g, '').slice(0, 15);
    } else if (name === 'name') {
      processedValue = value.slice(0, 100);
    } else if (name === 'email') {
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
      await register(formData);
      setSuccess(true);
      // Mostrar mensaje de éxito por 2 segundos antes de navegar
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al registrar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
          }}
        >
          <Typography component="h1" variant="h4" gutterBottom>
            Registrarse
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Crea tu cuenta en NexoHome
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

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="name"
              label="Nombre Completo"
              name="name"
              autoComplete="name"
              autoFocus
              value={formData.name}
              onChange={handleChange}
              error={!!formErrors.name}
              helperText={formErrors.name}
              inputProps={{ maxLength: 100 }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Correo Electrónico"
              name="email"
              type="email"
              autoComplete="email"
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
              autoComplete="new-password"
              value={formData.password}
              onChange={handleChange}
              error={!!formErrors.password}
              helperText={formErrors.password || 'Mínimo 8 caracteres, incluir mayúscula, minúscula, número y carácter especial'}
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
            <TextField
              margin="normal"
              required
              fullWidth
              id="cedula"
              label="Cédula"
              name="cedula"
              value={formData.cedula}
              onChange={handleChange}
              error={!!formErrors.cedula}
              helperText={formErrors.cedula || 'Entre 7 y 10 dígitos'}
              inputProps={{ maxLength: 10, inputMode: 'numeric', pattern: '[0-9]*' }}
            />
            <TextField
              margin="normal"
              fullWidth
              id="phone"
              label="Teléfono"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              error={!!formErrors.phone}
              helperText={formErrors.phone || 'Opcional - Entre 7 y 15 dígitos'}
              inputProps={{ maxLength: 15, inputMode: 'numeric', pattern: '[0-9]*' }}
            />
            <TextField
              margin="normal"
              select
              fullWidth
              id="role"
              label="Rol"
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
              error={!!formErrors.role}
              helperText={formErrors.role}
            >
              <MenuItem value="owner">Propietario</MenuItem>
              <MenuItem value="tenant">Arrendatario</MenuItem>
              <MenuItem value="airbnb_guest">Huésped Airbnb</MenuItem>
            </TextField>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? 'Registrando...' : 'Registrarse'}
            </Button>
            <Box sx={{ textAlign: 'center' }}>
              <Link href="/login" variant="body2">
                ¿Ya tienes cuenta? Inicia sesión
              </Link>
            </Box>
          </Box>
        </Paper>

        {/* Snackbar para mensaje de éxito */}
        <Snackbar
          open={success}
          autoHideDuration={2000}
          onClose={() => setSuccess(false)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={() => setSuccess(false)} severity="success" sx={{ width: '100%' }}>
            ¡Usuario registrado exitosamente!
          </Alert>
        </Snackbar>

        {/* Pantalla de carga durante registro */}
        {loading && <Loading message="Registrando usuario..." fullScreen />}
      </Box>
    </Container>
  );
};

export default Register;
