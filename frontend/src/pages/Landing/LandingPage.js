import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  AppBar,
  Toolbar,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Facebook, Twitter, Instagram } from '@mui/icons-material';
import LandingCarousel from '../../components/LandingCarousel';


const features = [
  {
    title: 'Gestión de Apartamentos',
    description: 'Administre y organice todos los apartamentos de manera eficiente y centralizada. Incluye registro de propiedades, asignación de inquilinos, seguimiento de ocupación y generación de reportes detallados para una gestión óptima del conjunto residencial.',
    image: "https://img.freepik.com/foto-gratis/agente-inmobiliario-sonriente-hablando-pareja-interesada-comprar-casa-nueva_637285-6081.jpg"
  },
  {
    title: 'Reportes de Daños',
    description: 'Informe y haga seguimiento a los daños para mantener la calidad y seguridad. Permite crear reportes con fotos, descripciones y prioridades, asignar responsables y monitorear el progreso de reparaciones hasta su resolución completa.',
    image: "https://img.freepik.com/fotos-premium/preocupado-hombre-negocios-maduro-anteojos-leyendo-documentos-lugar-trabajo-oficina-revisando-anualmente_116547-20516.jpg"
  },
  {
    title: 'Mantenimiento',
    description: 'Coordine y controle los mantenimientos para preservar el valor de la propiedad. Planifique tareas preventivas, programe reparaciones, asigne técnicos y mantenga un historial completo de todas las actividades de mantenimiento realizadas.',
    image: "https://img.freepik.com/foto-gratis/trabajadores-masculinos-femeninos-vistiendo-ropa-trabajo_273609-10995.jpg?semt=ais_hybrid&w=740&q=80"
  },
  {
    title: 'Pagos',
    description: 'Supervise pagos y transacciones de forma segura y transparente. Gestione cuotas de mantenimiento, pagos de servicios, registros de ingresos y egresos, con integración de métodos de pago electrónicos y generación automática de recibos.',
    image: "https://img.freepik.com/foto-gratis/primer-plano-hombre-que-realiza-pago-contacto-telefono-inteligente_637285-12517.jpg?semt=ais_hybrid&w=740&q=80"
  },
  {
    title: 'Notificaciones',
    description: 'Mantenga a todos informados con notificaciones instantáneas y relevantes. Envíe alertas sobre pagos pendientes, mantenimientos programados, eventos comunitarios y actualizaciones importantes directamente a través de la aplicación móvil.',
    image: "https://img.freepik.com/foto-gratis/chica-morena-sorprendida-e-impresionada-mirando-sorprendida-pantalla-telefono-inteligente_1258-19055.jpg"
  },
  {
    title: 'Usuarios',
    description: 'Gestione usuarios con roles y permisos específicos para un control adecuado. Defina administradores, propietarios, inquilinos y personal de mantenimiento con accesos diferenciados, asegurando la seguridad y confidencialidad de la información.',
    image: "https://img.freepik.com/foto-gratis/grupo-jovenes-sosteniendo-sus-telefonos-moviles_23-2148431356.jpg"
  },
];

const LandingPage = () => {
  const navigate = useNavigate();
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        backgroundColor: '#003354',
      }}
    >
      {/* Header */}
      <AppBar position="fixed" sx={{ bgcolor: 'white', color: 'primary.main', boxShadow: 1, opacity:0.9  }}>
        <Toolbar>
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 800,
                fontSize: { xs: '1.5rem', md: '2rem' },
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
                  width: { xs: 25, md: 35 },
                  height: { xs: 25, md: 35 },
                  mx: 0.5,
                  transform: 'translateY(-1px)'
                }}
              />
              Home
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Button color="inherit" onClick={() => scrollToSection('features')} sx={{ textTransform: 'none', fontWeight: 600 }}>
              Funcionalidades
            </Button>
            <Button color="inherit" onClick={() => scrollToSection('offers')} sx={{ textTransform: 'none', fontWeight: 600 }}>
              ¿Qué Ofrece?
            </Button>
            <Button color="inherit" onClick={() => scrollToSection('plans')} sx={{ textTransform: 'none', fontWeight: 600 }}>
              Planes
            </Button>
            <Button
              variant="outlined"
              color="primary"
              onClick={() => navigate('/login')}
              sx={{
                fontWeight: 600,
                borderRadius: '12px',
                textTransform: 'none',
                px: { xs: 2, md: 3 },
                py: { xs: 0.5, md: 0.9 },
                fontSize: { xs: '0.8rem', md: '1rem' },
              }}
            >
              Iniciar sesión
            </Button>
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
        </Toolbar>
      </AppBar>

      <Box
        sx={{
          flex: 1,
          position: 'relative',
          overflowX: 'hidden',
        }}
      >

        <Box
          sx={{
            py: 8,
            px: { xs: 2, sm: 4 },
          }}
        >
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
        </Box>

        {/* Features Section */}
        <Box id="features" sx={{ bgcolor: '#f5f5f5', py: 8 }}>
          <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 700, color: 'primary.main', textAlign: 'center', mb: 4, fontSize: { xs: '1.5rem', md: '2.125rem' }, px: { xs: 2, sm: 4 } }}>
            Funcionalidades Destacadas
          </Typography>
          <Box sx={{ px: { xs: 2, sm: 4 } }}>
            <LandingCarousel features={features} />
          </Box>
        </Box>

        {/* ¿Qué ofrece? Section */}
        <Box id="offers" sx={{ bgcolor: 'background.paper', py: 8 }}>
          <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 700, color: 'primary.main', textAlign: 'center', mb: 4, fontSize: { xs: '1.5rem', md: '2.125rem' }, px: { xs: 2, sm: 4 } }}>
            ¿Qué Ofrece NexoHome?
          </Typography>
          <Box sx={{ px: { xs: 2, sm: 4 } }}>
            <Grid container spacing={4} justifyContent="center">
              <Grid item xs={12} md={4}>
                <Box sx={{ textAlign: 'center', p: 4, borderRadius: 2, boxShadow: 3, bgcolor: 'background.paper', minHeight: 100 }}>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
                    Eficiencia Operativa
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                    Automatice procesos administrativos, reduzca costos operativos y optimice la gestión del tiempo con herramientas digitales avanzadas.
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ textAlign: 'center', p: 4, borderRadius: 2, boxShadow: 3, bgcolor: 'background.paper', minHeight: 100 }}>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
                    Seguridad y Confidencialidad
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                    Proteja la información sensible con encriptación de datos, controles de acceso basados en roles y cumplimiento de normativas de privacidad.
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ textAlign: 'center', p: 4, borderRadius: 2, boxShadow: 3, bgcolor: 'background.paper', minHeight: 100 }}>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
                    Soporte Integral
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                    Reciba asistencia técnica especializada, capacitación para usuarios y actualizaciones continuas para mantener su sistema al día.
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Box>

        {/* Planes Section */}
        <Box id="plans" sx={{ bgcolor: '#f0f8ff', py: 8 }}>
          <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 700, color: 'primary.main', textAlign: 'center', mb: 4, fontSize: { xs: '1.5rem', md: '2.125rem' }, px: { xs: 2, sm: 4 } }}>
            Planes y Precios
          </Typography>
          <Box sx={{ px: { xs: 2, sm: 4 } }}>
            <Grid container spacing={4} justifyContent="center">
              <Grid item xs={12} md={4}>
                <Box sx={{ textAlign: 'center', p: 4, borderRadius: 2, boxShadow: 3, bgcolor: 'background.paper', border: '2px solid #e0e0e0', minHeight: 400 }}>
                  <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, color: 'primary.main' }}>
                    Básico
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 800, color: 'primary.main', mb: 2 }}>
                    $29/mes
                  </Typography>
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="body2" sx={{ mb: 1 }}>• Gestión de hasta 50 apartamentos</Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>• Reportes de daños básicos</Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>• Sistema de pagos simple</Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>• Notificaciones por email</Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>• Soporte por email</Typography>
                  </Box>
                  <Button variant="outlined" color="primary" sx={{ fontWeight: 600 }}>
                    Elegir Plan
                  </Button>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ textAlign: 'center', p: 4, borderRadius: 2, boxShadow: 3, bgcolor: 'primary.main', color: 'white', position: 'relative', minHeight: 400 }}>
                  <Box sx={{ position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)', bgcolor: 'secondary.main', color: 'white', px: 2, py: 0.5, borderRadius: 1, fontSize: '0.75rem', fontWeight: 600 }}>
                    Más Popular
                  </Box>
                  <Typography variant="h5" gutterBottom sx={{ fontWeight: 700 }}>
                    Premium
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 800, mb: 2 }}>
                    $59/mes
                  </Typography>
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="body2" sx={{ mb: 1 }}>• Gestión ilimitada de apartamentos</Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>• Reportes de daños avanzados con fotos</Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>• Sistema de pagos completo</Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>• Notificaciones push y SMS</Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>• Mantenimiento programado</Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>• Soporte prioritario</Typography>
                  </Box>
                  <Button variant="outlined" sx={{ fontWeight: 600, bgcolor: 'white', color: 'primary.main', '&:hover': { bgcolor: '#003354' } }}>
                    Elegir Plan
                  </Button>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ textAlign: 'center', p: 4, borderRadius: 2, boxShadow: 3, bgcolor: 'background.paper', border: '2px solid #e0e0e0', minHeight: 400 }}>
                  <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, color: 'primary.main' }}>
                    Empresarial
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 800, color: 'primary.main', mb: 2 }}>
                    $99/mes
                  </Typography>
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="body2" sx={{ mb: 1 }}>• Todo lo del plan Premium</Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>• API para integraciones</Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>• Reportes personalizados</Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>• Múltiples conjuntos residenciales</Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>• Soporte 24/7</Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>• Capacitación personalizada</Typography>
                  </Box>
                  <Button variant="outlined" color="primary" sx={{ fontWeight: 600 }}>
                    Elegir Plan
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Box>

      {/* Privacy Policy Dialog */}
      <Dialog open={privacyOpen} onClose={() => setPrivacyOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: 'primary.main' }}>
          Política de Privacidad
        </DialogTitle>
        <DialogContent>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: 'primary.main', mt: 2 }}>
            Recopilación de Información
          </Typography>
          <Typography variant="body1" paragraph sx={{ color: 'text.secondary', mb: 3 }}>
            Recopilamos información personal que usted nos proporciona directamente, como nombre, dirección de correo electrónico, número de teléfono y otra información necesaria para proporcionar nuestros servicios de gestión de conjuntos residenciales.
          </Typography>

          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
            Uso de la Información
          </Typography>
          <Typography variant="body1" paragraph sx={{ color: 'text.secondary', mb: 3 }}>
            Utilizamos la información recopilada para proporcionar, mantener y mejorar nuestros servicios, procesar transacciones, enviar comunicaciones relacionadas con el servicio y cumplir con obligaciones legales.
          </Typography>

          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
            Protección de Datos
          </Typography>
          <Typography variant="body1" paragraph sx={{ color: 'text.secondary', mb: 3 }}>
            Implementamos medidas de seguridad técnicas y organizativas apropiadas para proteger su información personal contra acceso no autorizado, alteración, divulgación o destrucción.
          </Typography>

          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
            Compartir Información
          </Typography>
          <Typography variant="body1" paragraph sx={{ color: 'text.secondary' }}>
            No vendemos, alquilamos ni compartimos su información personal con terceros, excepto cuando sea necesario para proporcionar nuestros servicios o cuando lo exija la ley.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPrivacyOpen(false)} color="primary">
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Terms and Conditions Dialog */}
      <Dialog open={termsOpen} onClose={() => setTermsOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: 'primary.main' }}>
          Términos y Condiciones
        </DialogTitle>
        <DialogContent>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: 'primary.main', mt: 2 }}>
            Aceptación de Términos
          </Typography>
          <Typography variant="body1" paragraph sx={{ color: 'text.secondary', mb: 3 }}>
            Al acceder y utilizar NexoHome, usted acepta estar sujeto a estos términos y condiciones de uso. Si no está de acuerdo con estos términos, no utilice nuestros servicios.
          </Typography>

          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
            Uso del Servicio
          </Typography>
          <Typography variant="body1" paragraph sx={{ color: 'text.secondary', mb: 3 }}>
            Nuestro servicio está destinado únicamente para la gestión legítima de conjuntos residenciales. Usted se compromete a utilizar el servicio de manera responsable y conforme a todas las leyes aplicables.
          </Typography>

          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
            Responsabilidades del Usuario
          </Typography>
          <Typography variant="body1" paragraph sx={{ color: 'text.secondary', mb: 3 }}>
            Usted es responsable de mantener la confidencialidad de sus credenciales de acceso y de todas las actividades que ocurran bajo su cuenta. Debe proporcionar información precisa y actualizada.
          </Typography>

          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
            Limitación de Responsabilidad
          </Typography>
          <Typography variant="body1" paragraph sx={{ color: 'text.secondary' }}>
            NexoHome no será responsable por daños indirectos, incidentales o consecuentes que surjan del uso o la imposibilidad de usar nuestros servicios, salvo en los casos requeridos por la ley.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTermsOpen(false)} color="primary">
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Footer */}
      <Box sx={{ bgcolor: '#003354', color: 'white', py: 6, mt: 8 }}>
        <Container maxWidth="lg">
          <Grid container spacing={4} justifyContent="center">
            <Grid item xs={12} md={4} sx={{ textAlign: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
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
              <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                <Facebook sx={{ cursor: 'pointer', '&:hover': { color: '#1877f2' } }} />
                <Twitter sx={{ cursor: 'pointer', '&:hover': { color: '#1da1f2' } }} />
                <Instagram sx={{ cursor: 'pointer', '&:hover': { color: '#e4405f' } }} />
              </Box>
            </Grid>
            <Grid item xs={12} md={4} sx={{ textAlign: 'center' }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, fontSize: { xs: '1rem', md: '1.25rem' } }}>
                Información Legal
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'center' }}>
                <Button color="inherit" sx={{ p: 0, textTransform: 'none', fontSize: { xs: '0.8rem', md: '1rem' } }} onClick={() => setPrivacyOpen(true)}>
                  Política de Privacidad
                </Button>
                <Button color="inherit" sx={{ p: 0, textTransform: 'none', fontSize: { xs: '0.8rem', md: '1rem' } }} onClick={() => setTermsOpen(true)}>
                  Términos de Uso
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12} md={4} sx={{ textAlign: 'center' }}>
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
              © 2025 NexoHome. Todos los derechos reservados.
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default LandingPage;
