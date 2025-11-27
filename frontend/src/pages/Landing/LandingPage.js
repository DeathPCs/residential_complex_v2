import React from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Grid,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Facebook, Twitter, Instagram } from '@mui/icons-material';
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
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        backgroundColor: 'background.default',
      }}
    >
      <Box
        sx={{
          flex: 1,
          py: 8,
          px: { xs: 2, sm: 4 },
          position: 'relative',
          overflowX: 'hidden',
        }}
      >
        {/* Logo Top Left */}
        <Box sx={{ position: 'absolute', top: 2, left: { xs: 10, md: 50 }, zIndex: 1200 }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 800,
              fontSize: { xs: '1.5rem', md: '3rem' },
              color: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer',
              userSelect: 'none',
              py: {xs:1.5},
            }}
            onClick={() => window.location.href = '/'}
          >
            Nexo
            <Box
              component="img"
              src="/logo.png"
              alt="logo"
              sx={{
                width: { xs: 30, md: 45 },
                height: { xs: 30, md: 45 },
                mx: 0.3,
                transform: 'translateY(-1px)'
              }}
            />
            Home
          </Typography>
        </Box>

        {/* Login Button Top Right */}
        <Box sx={{ position: 'absolute', top: 12, right: { xs: 120, md: 160 }, zIndex: 1200 }}>
          <Button
            variant="outlined"
            color="primary"
            onClick={() => navigate('/login')}
            sx={{
              fontWeight: 600,
              borderRadius: '12px',
              textTransform: 'none',
              px: { xs: 2, md: 3 },
              py: { xs: 0.5, md: 1 },
              fontSize: { xs: '0.8rem', md: '1rem' },
            }}
          >
            Iniciar sesión
          </Button>
        </Box>
        <Box sx={{ position: 'absolute', top: 12, right: { xs: 10, md: 24 }, zIndex: 1200 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/register')}
            sx={{
              fontWeight: 600,
              borderRadius: '12px',
              textTransform: 'none',
              px: { xs: 2, md: 3 },
              py: { xs: 0.7, md: 1 },
              boxShadow: 4,
              transition: 'background-color 0.3s ease',
              fontSize: { xs: '0.8rem', md: '1rem' },
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
            <Typography variant="h2" component="h1" fontSize={{ xs: 28, md: 45 }} gutterBottom sx={{ fontWeight: 800, letterSpacing: '0.05em', paddingY: { xs: 2, md: 5 } }}>
              Sistema de Gestión de Conjuntos Residenciales
            </Typography>
            <Typography variant="h6" paragraph fontSize={{ xs: 14, md: 18 }} sx={{ fontWeight: 400, letterSpacing: '0.01em' }}>
              Administre su conjunto residencial de forma sencilla y eficiente con nuestra plataforma integral.
            </Typography>
          </Box>
        </Box>

        {/* Features Section */}
        <Container maxWidth="100" sx={{ mb: 8 }}>
          <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 700, color: 'primary.main', textAlign: 'center', mb: 4, fontSize: { xs: '1.5rem', md: '2.125rem' } }}>
            Funcionalidades Destacadas
          </Typography>
          <LandingCarousel features={features} />
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ bgcolor: 'primary.main', color: 'white', py: 6, mt: 8 }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box
                  component="img"
                  src="/logoB.png"
                  alt="NexoHome Logo"
                  sx={{ width: 40, height: 40, mr: 1 }}
                />
                <Typography variant="h6" sx={{ fontWeight: 700, fontSize: { xs: '1rem', md: '1.25rem' } }}>
                  NexoHome
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ mb: 2, fontSize: { xs: '0.75rem', md: '0.875rem' } }}>
                Sistema de Gestión de Conjuntos Residenciales
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Facebook sx={{ cursor: 'pointer', '&:hover': { color: '#1877f2' } }} />
                <Twitter sx={{ cursor: 'pointer', '&:hover': { color: '#1da1f2' } }} />
                <Instagram sx={{ cursor: 'pointer', '&:hover': { color: '#e4405f' } }} />
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, fontSize: { xs: '1rem', md: '1.25rem' } }}>
                Información Legal
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Button color="inherit" sx={{ justifyContent: 'flex-start', p: 0, textTransform: 'none', fontSize: { xs: '0.8rem', md: '1rem' } }}>
                  Política de Privacidad
                </Button>
                <Button color="inherit" sx={{ justifyContent: 'flex-start', p: 0, textTransform: 'none', fontSize: { xs: '0.8rem', md: '1rem' } }}>
                  Términos de Uso
                </Button>
                <Button color="inherit" sx={{ justifyContent: 'flex-start', p: 0, textTransform: 'none', fontSize: { xs: '0.8rem', md: '1rem' } }}>
                  Información Legal
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, fontSize: { xs: '1rem', md: '1.25rem' } }}>
                Contacto
              </Typography>
              <Typography variant="body2" sx={{ mb: 1, fontSize: { xs: '0.75rem', md: '0.875rem' } }}>
                Email: info@nexohome.com
              </Typography>
              <Typography variant="body2" sx={{ mb: 1, fontSize: { xs: '0.75rem', md: '0.875rem' } }}>
                Teléfono: +57 (301) 123-4567
              </Typography>
              <Typography variant="body2" sx={{ fontSize: { xs: '0.75rem', md: '0.875rem' } }}>
                Dirección: Calle Principal 123, Neiva, Colombia
              </Typography>
            </Grid>
          </Grid>
          <Box sx={{ borderTop: 1, borderColor: 'rgba(255,255,255,0.2)', mt: 4, pt: 2, textAlign: 'center' }}>
            <Typography variant="body2">
              © 2023 NexoHome. Todos los derechos reservados.
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default LandingPage;
