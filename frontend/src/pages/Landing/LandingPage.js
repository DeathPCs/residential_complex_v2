import React from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
} from '@mui/material';
import { Apartment, Build, Report, Payment, Notifications, People } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const features = [
  {
    title: 'Gestión de Apartamentos',
    description: 'Administre y organice todos los apartamentos de manera eficiente y centralizada.',
    icon: <Apartment sx={{ fontSize: 40, color: 'primary.main' }} />,
  },
  {
    title: 'Reportes de Daños',
    description: 'Informe y haga seguimiento a los daños para mantener la calidad y seguridad.',
    icon: <Report sx={{ fontSize: 40, color: 'error.main' }} />,
  },
  {
    title: 'Mantenimiento',
    description: 'Coordine y controle los mantenimientos para preservar el valor de la propiedad.',
    icon: <Build sx={{ fontSize: 40, color: 'secondary.main' }} />,
  },
  {
    title: 'Pagos',
    description: 'Supervise pagos y transacciones de forma segura y transparente.',
    icon: <Payment sx={{ fontSize: 40, color: 'success.main' }} />,
  },
  {
    title: 'Notificaciones',
    description: 'Mantenga a todos informados con notificaciones instantáneas y relevantes.',
    icon: <Notifications sx={{ fontSize: 40, color: 'warning.main' }} />,
  },
  {
    title: 'Usuarios',
    description: 'Gestione usuarios con roles y permisos específicos para un control adecuado.',
    icon: <People sx={{ fontSize: 40, color: 'info.main' }} />,
  },
];

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ backgroundColor: 'background.default', minHeight: '100vh', py: 6, position: 'relative' }}>
      {/* Login Button Top Right */}
      <Box sx={{ position: 'fixed', top: 5, right: 130, zIndex: 1200 }}>
        <Button variant="outlined" color="primary" onClick={() => navigate('/login')}>
          Iniciar sesión
        </Button>
      </Box>
      <Box sx={{ position: 'fixed', top: 5, right: 16, zIndex: 1200 }}>
        <Button variant="contained" color="primary" onClick={() => navigate('/register')}>
          Regístrate
        </Button>
      </Box>

      {/* Hero Section with background image */}
      <Box
        sx={{
          position: 'relative',
          height: 400,
          mb: 8,
          backgroundImage: 'url(https://tecnne.com/wp-content/uploads/2022/11/ACDF-Architecture-Joie-de-Vivre-Residential-Building-tecnne.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          borderRadius: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          textAlign: 'center',
          px: 3,
        }}
      >
        {/* Overlay */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            borderRadius: 3,
            zIndex: 1,
          }}
        />

        {/* Content */}
        <Box sx={{ position: 'relative', zIndex: 2, maxWidth: 600 }}>
          <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
            Sistema de Gestión de Conjuntos Residenciales — NexoHome
          </Typography>
          <Typography variant="h6" paragraph>
            Administre su conjunto residencial de forma sencilla y eficiente con nuestra plataforma integral.
          </Typography>
        </Box>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg">
        <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 600, mb: 4, color: 'primary.main' }}>
          Características Destacadas
        </Typography>
        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card sx={{
                height: 200,
                width: 500,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                py: 4,
                boxSizing: 'border-box',
              }}>
                {feature.icon}
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default LandingPage;
