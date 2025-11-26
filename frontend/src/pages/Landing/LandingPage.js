import React from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import LandingCarousel from '../../components/LandingCarousel';


const features = [
  {
    title: 'Gestión de Apartamentos',
    description: 'Administre y organice todos los apartamentos de manera eficiente y centralizada.',
    image: "https://img.freepik.com/foto-gratis/agente-inmobiliario-sonriente-hablando-pareja-interesada-comprar-casa-nueva_637285-6081.jpg"
  },
  {
    title: 'Reportes de Daños',
    description: 'Informe y haga seguimiento a los dañosy para mantener la calidad y seguridad.',
    image: "https://img.freepik.com/fotos-premium/preocupado-hombre-negocios-maduro-anteojos-leyendo-documentos-lugar-trabajo-oficina-revisando-anualmente_116547-20516.jpg"
  },
  {
    title: 'Mantenimiento',
    description: 'Coordine y controle los mantenimientos para preservar el valor de la propiedad.',
    image: "https://img.freepik.com/foto-gratis/trabajadores-masculinos-femeninos-vistiendo-ropa-trabajo_273609-10995.jpg?semt=ais_hybrid&w=740&q=80"
  },
  {
    title: 'Pagos',
    description: 'Supervise pagos y transacciones de forma segura y transparente.',
    image: "https://img.freepik.com/foto-gratis/primer-plano-hombre-que-realiza-pago-contacto-telefono-inteligente_637285-12517.jpg?semt=ais_hybrid&w=740&q=80"
  },
  {
    title: 'Notificaciones',
    description: 'Mantenga a todos informados con notificaciones instantáneas y relevantes.',
    image: "https://img.freepik.com/foto-gratis/chica-morena-sorprendida-e-impresionada-mirando-sorprendida-pantalla-telefono-inteligente_1258-19055.jpg"
  },
  {
    title: 'Usuarios',
    description: 'Gestione usuarios con roles y permisos específicos para un control adecuado.',
    image: "https://img.freepik.com/foto-gratis/grupo-jovenes-sosteniendo-sus-telefonos-moviles_23-2148431356.jpg"
  },
];

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        backgroundColor: 'background.default',
        minHeight: '100vh',
        py: 8,
        px: { xs: 2, sm: 4 },
        position: 'relative',
        overflowX: 'hidden',
      }}
    >
      {/* Logo Top Left */}
      <Box sx={{ position: 'absolute', top: 2, left: 50, zIndex: 1200 }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 800,
            fontSize: '3rem',
            color: 'primary.main',
            display: 'flex',
            alignItems: 'center',
            cursor: 'pointer',
            userSelect: 'none',
          }}
          onClick={() => window.location.href = '/'}
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
      </Box>

      {/* Login Button Top Right */}
      <Box sx={{ position: 'absolute', top: 12, right: 160, zIndex: 1200 }}>
        <Button
          variant="outlined"
          color="primary"
          onClick={() => navigate('/login')}
          sx={{
            fontWeight: 600,
            borderRadius: '12px',
            textTransform: 'none',
            px: 3,
            py: 0.9,
          }}
        >
          Iniciar sesión
        </Button>
      </Box>
      <Box sx={{ position: 'absolute', top: 12, right: 24, zIndex: 1200 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate('/register')}
          sx={{
            fontWeight: 600,
            borderRadius: '12px',
            textTransform: 'none',
            px: 3,
            py: 1,
            boxShadow: 4,
            transition: 'background-color 0.3s ease',
            '&:hover': {
              backgroundColor: '#003354',
            },
          }}
        >
          Regístrate
        </Button>
      </Box>

      {/* Hero Section with background image */}
      <Box
        sx={{
          position: 'relative',
          height: { xs: 300, md: 400 },          
          mt: 2,
          mb: 5,
          backgroundImage: 'url(https://tecnne.com/wp-content/uploads/2022/11/ACDF-Architecture-Joie-de-Vivre-Residential-Building-tecnne.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          borderRadius: 4,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          textAlign: 'center',
          px: 3,
          boxShadow: 3,
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
            backgroundColor: 'rgba(0, 0, 0, 0.55)',
            borderRadius: 4,
            zIndex: 1,
          }}
        />

        {/* Content */}
        <Box sx={{ position: 'relative', zIndex: 2, maxWidth: 640 }}>
          <Typography variant="h2" component="h1" fontSize={45} gutterBottom sx={{ fontWeight: 800, letterSpacing: '0.05em', paddingY: 5 }}>
            Sistema de Gestión de Conjuntos Residenciales
          </Typography>
          <Typography variant="h6" paragraph fontSize={18} sx={{ fontWeight: 400, letterSpacing: '0.01em' }}>
            Administre su conjunto residencial de forma sencilla y eficiente con nuestra plataforma integral.
          </Typography>
        </Box>
      </Box>

      {/* Features Section */}
      <Container maxWidth="100" sx={{ mb: 6 }}>
        <Typography variant="g" component="h2" gutterBottom sx={{ fontWeight: 800, mb: 2, color: 'primary.main', letterSpacing: '0.03em' }}>
          Características Destacadas
        </Typography>
        <LandingCarousel features={features} />
      </Container>
    </Box>
  );
};

export default LandingPage;
