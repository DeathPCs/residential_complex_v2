import React, { useEffect, useState, useContext, useRef } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Alert,
  Button,
} from '@mui/material';
import {
  Apartment,
  Build,
  Report,
  Payment,
  Notifications,
  People,
  Refresh,
} from '@mui/icons-material';
import api from '../../services/api';
import Loading from '../../components/common/Loading';
import { AuthContext } from '../../context/AuthContext';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({
    apartments: 0,
    maintenance: 0,
    damageReports: 0,
    payments: 0,
    notifications: 0,
    users: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const fetchInProgress = useRef(false);

  const fetchStats = async () => {
    // Prevenir múltiples llamadas concurrentes
    if (fetchInProgress.current) return;
    fetchInProgress.current = true;
    
    try {
      setLoading(true);
      setError(null);

      const requests = [];

      // Only fetch data for allowed sections based on user role
      if (user?.role === 'admin' || user?.role === 'owner') {
        requests.push(api.get('/apartments').catch(() => ({ data: { data: [] } })));
      } else {
        requests.push(Promise.resolve({ data: { data: [] } }));
      }

      if (user?.role === 'admin') {
        requests.push(api.get('/maintenance').catch(() => ({ data: { data: [] } })));
      } else {
        requests.push(Promise.resolve({ data: { data: [] } }));
      }

      if (['admin', 'owner', 'tenant', 'airbnb_guest'].includes(user?.role)) {
        requests.push(api.get('/notifications').catch(() => ({ data: { data: [] } })));
      } else {
        requests.push(Promise.resolve({ data: { data: [] } }));
      }

      if (['admin', 'owner', 'security'].includes(user?.role)) {
        requests.push(api.get('/airbnb/guests/active').catch(() => ({ data: { data: [] } })));
      } else {
        requests.push(Promise.resolve({ data: { data: [] } }));
      }

      let damageReportsRequest;
      if (user?.role === 'admin') {
        damageReportsRequest = api.get('/damage-reports').catch(() => ({ data: { data: [], total: 0 } }));
      } else if (['owner', 'tenant', 'airbnb_guest'].includes(user?.role)) {
        damageReportsRequest = api.get('/damage-reports/my-reports').catch(() => ({ data: { data: [] } }));
      } else {
        damageReportsRequest = Promise.resolve({ data: { data: [] } });
      }
      requests.push(damageReportsRequest);

      if (user?.role === 'admin') {
        requests.push(api.get('/payments').catch(() => ({ data: { data: [] } })));
      } else {
        requests.push(Promise.resolve({ data: { data: [] } }));
      }

      if (user?.role === 'admin') {
        requests.push(api.get('/users').catch(() => ({ data: { data: [] } })));
      } else {
        requests.push(Promise.resolve({ data: { data: [] } }));
      }

      const [apartmentsRes, maintenanceRes, notificationsRes, airbnbRes, damageReportsRes, paymentsRes, usersRes] = await Promise.all(requests);

      setStats({
        apartments: apartmentsRes.data.data?.length || 0,
        maintenance: maintenanceRes.data.data?.length || 0,
        damageReports: damageReportsRes.data.total || damageReportsRes.data.data?.length || 0,
        payments: paymentsRes.data.data?.length || 0,
        notifications: notificationsRes.data.data?.length || 0,
        users: usersRes.data.total || usersRes.data.data?.length || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      setError(error.userMessage || 'Error al cargar las estadísticas');
    } finally {
      setLoading(false);
      fetchInProgress.current = false;
    }
  };

  useEffect(() => {
    if (user) {
      fetchStats();
    }
  }, [user]);

  // Define role-based access for cards
  const getAllowedCards = () => {
    const allCards = [
      {
        title: 'Apartamentos',
        value: stats.apartments,
        icon: <Apartment sx={{ fontSize: 50, color: 'primary.main' }} />,
        color: 'primary.main',
        allowedRoles: ['admin', 'owner', 'tenant', 'airbnb_guest'],
      },
      {
        title: 'Reportes de Daños',
        value: stats.damageReports,
        icon: <Report sx={{ fontSize: 50, color: 'error.main' }} />,
        color: 'error.main',
        allowedRoles: ['admin', 'owner', 'tenant', 'airbnb_guest'],
      },
      {
        title: 'Mantenimientos',
        value: stats.maintenance,
        icon: <Build sx={{ fontSize: 50, color: 'secondary.main' }} />,
        color: 'secondary.main',
        allowedRoles: ['admin'],
      },
      {
        title: 'Pagos',
        value: stats.payments,
        icon: <Payment sx={{ fontSize: 50, color: 'success.main' }} />,
        color: 'success.main',
        allowedRoles: ['admin', 'owner', 'tenant', 'airbnb_guest'],
      },
      {
        title: 'Notificaciones',
        value: stats.notifications,
        icon: <Notifications sx={{ fontSize: 50, color: 'warning.main' }} />,
        color: 'warning.main',
        allowedRoles: ['admin', 'owner', 'tenant', 'airbnb_guest'],
      },
      {
        title: 'Usuarios',
        value: stats.users,
        icon: <People sx={{ fontSize: 50, color: 'info.main' }} />,
        color: 'info.main',
        allowedRoles: ['admin'],
      },
    ];

    if (!user) return [];

    return allCards.filter(card => card.allowedRoles.includes(user.role));
  };

  const cards = getAllowedCards();

  if (loading) {
    return <Loading message="Cargando estadísticas..." />;
  }

  return (
    <Container maxWidth="lg" sx={{ pb: 6 }}>
      <Box sx={{ mb: 5 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, letterSpacing: '0.03em' }}>
          Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ letterSpacing: '0.01em' }}>
          Bienvenido al sistema de gestión de conjuntos residenciales.
        </Typography>
      </Box>

      {error && (
        <Alert
          severity="error"
          sx={{ mb: 4 }}
          action={
            <Button
              color="inherit"
              size="small"
              startIcon={<Refresh />}
              onClick={fetchStats}
              sx={{ fontWeight: 600, borderRadius: 2, px: 2 }}
            >
              Reintentar
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      <Grid container spacing={4}>
        {cards.map((card, index) => (
          <Grid item xs={12} sm={6} md={4} lg={3} xl={2} key={index}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                borderRadius: 3,
                boxShadow: 3,
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                cursor: 'default',
                '&:hover': {
                  transform: 'translateY(-6px)',
                  boxShadow: 6,
                },
              }}
            >
              <CardContent sx={{ flexGrow: 1, width: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  {card.icon}
                  <Typography variant="h6" sx={{ ml: 2, fontWeight: 700, letterSpacing: '0.02em' }}>
                    {card.title}
                  </Typography>
                </Box>
                <Typography variant="h3" component="div" sx={{ fontWeight: 700 }}>
                  {card.value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default Dashboard;
