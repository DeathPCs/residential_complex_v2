import React, { useEffect, useState, useContext, useRef } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Container, Typography, Box, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Chip, Paper, InputAdornment, IconButton, Grid, Card, CardContent, Alert, Snackbar, } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { Add, Search, CheckCircle, Delete, Hotel, Person, Event, AccessTime, Edit,
} from '@mui/icons-material';
import { getAirbnbGuests, getActiveAirbnbGuests, createAirbnbGuest, updateAirbnbGuest, checkinAirbnbGuest, checkoutAirbnbGuest, deleteAirbnbGuest, getApartments, } from '../../services/api';
import ConfirmDialog from '../../components/common/ConfirmDialog';

const Airbnb = () => {
  const { user } = useContext(AuthContext);
  const [guests, setGuests] = useState([]);
  const [activeGuests, setActiveGuests] = useState([]);
  const [apartments, setApartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null, name: '' });
  const [formErrors, setFormErrors] = useState({});
  const [formAlert, setFormAlert] = useState('');
  const fetchInProgress = useRef(false);
  const [formData, setFormData] = useState({
    apartmentId: '',
    guestName: '',
    guestCedula: '',
    numberOfGuests: 1,
    checkInDate: '',
    checkOutDate: '',
  });

  useEffect(() => {
    fetchGuests();
    fetchActiveGuests();
    fetchApartments();
  }, []);

  const fetchGuests = async () => {
    // Prevenir múltiples llamadas concurrentes
    if (fetchInProgress.current) return;
    fetchInProgress.current = true;
    
    try {
      const guestsData = await getAirbnbGuests();
      setGuests((guestsData || []).filter(Boolean));
    } catch (error) {
      console.error('Error fetching guests:', error);
      setGuests([]);
    } finally {
      fetchInProgress.current = false;
    }
  };

  const fetchActiveGuests = async () => {
    try {
      setLoading(true);
      const activeGuestsData = await getActiveAirbnbGuests();
      setActiveGuests(activeGuestsData || []);
    } catch (error) {
      console.error('Error fetching active guests:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchApartments = async () => {
    try {
      const apartmentsData = await getApartments();
      setApartments(apartmentsData || []);
    } catch (error) {
      console.error('Error fetching apartments:', error);
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.apartmentId) {
      errors.apartmentId = 'El apartamento es requerido';
    }
    
    if (!formData.guestName.trim()) {
      errors.guestName = 'El nombre del huésped es requerido';
    } else if (formData.guestName.trim().length < 2) {
      errors.guestName = 'El nombre debe tener al menos 2 caracteres';
    } else if (formData.guestName.trim().length > 100) {
      errors.guestName = 'El nombre no puede exceder 100 caracteres';
    }
    
    if (!formData.guestCedula.trim()) {
      errors.guestCedula = 'La cédula del huésped es requerida';
    } else if (!/^\d{7,10}$/.test(formData.guestCedula.trim())) {
      errors.guestCedula = 'La cédula debe tener entre 7 y 10 dígitos';
    }
    
    if (!formData.numberOfGuests || formData.numberOfGuests < 1) {
      errors.numberOfGuests = 'El número de huéspedes debe ser al menos 1';
    } else if (formData.numberOfGuests > 20) {
      errors.numberOfGuests = 'El número de huéspedes no puede exceder 20';
    }
    
    if (!formData.checkInDate) {
      errors.checkInDate = 'La fecha de entrada es requerida';
    }
    
    if (!formData.checkOutDate) {
      errors.checkOutDate = 'La fecha de salida es requerida';
    } else if (formData.checkInDate && formData.checkOutDate) {
      const checkIn = new Date(formData.checkInDate);
      const checkOut = new Date(formData.checkOutDate);
      if (checkOut <= checkIn) {
        errors.checkOutDate = 'La fecha de salida debe ser posterior a la fecha de entrada';
      }
    }
    
    setFormErrors(errors);

    if (Object.keys(errors).length > 0) {
      const firstKey = Object.keys(errors)[0];
      setFormAlert(errors[firstKey]);
    } else {
      setFormAlert('');
    }

    return Object.keys(errors).length === 0;
  };

  const handleCreate = async () => {
    if (!validateForm()) {
      return;
    }
    
    try {
      if (editing) {
        await updateAirbnbGuest(editing.id, formData);
        setSuccess('Huésped actualizado exitosamente');
      } else {
        await createAirbnbGuest(formData);
        setSuccess('Huésped registrado exitosamente');
      }
      setOpen(false);
      setEditing(null);
      setFormData({
        apartmentId: '',
        guestName: '',
        guestCedula: '',
        numberOfGuests: 1,
        checkInDate: '',
        checkOutDate: '',
      });
      setFormErrors({});
      setFormAlert('');
      fetchGuests();
      fetchActiveGuests();
    } catch (error) {
      console.error('Error creating/updating guest:', error);
      setError(error.userMessage || 'Error al crear/actualizar huésped');
    }
  };

  const handleEdit = (guest) => {
    setEditing(guest);
    setFormData({
      apartmentId: guest.apartmentId || '',
      guestName: guest.guestName,
      guestCedula: guest.guestCedula,
      numberOfGuests: guest.numberOfGuests,
      checkInDate: guest.checkInDate.split('T')[0], // Format for date input
      checkOutDate: guest.checkOutDate.split('T')[0],
    });
    setFormErrors({});
    setFormAlert('');
    setOpen(true);
  };

  const handleCheckIn = async (id) => {
    try {
      const updatedGuest = await checkinAirbnbGuest(id);
      setGuests(prev => prev.map(g => g.id === id ? updatedGuest : g));
      setSuccess('Check-in realizado exitosamente');
      fetchActiveGuests();
    } catch (error) {
      console.error('Error checking in guest:', error);
      setError(error.userMessage || 'Error al realizar check-in');
    }
  };

  const handleCheckOut = async (id) => {
    try {
      const updatedGuest = await checkoutAirbnbGuest(id);
      setGuests(prev => prev.map(g => g.id === id ? updatedGuest : g));
      setSuccess('Check-out realizado exitosamente');
      fetchActiveGuests();
    } catch (error) {
      console.error('Error checking out guest:', error);
      setError(error.userMessage || 'Error al realizar check-out');
    }
  };

  const handleDeleteClick = (id, name) => {
    setDeleteDialog({ open: true, id, name });
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteAirbnbGuest(deleteDialog.id);
      setSuccess('Huésped eliminado exitosamente');
      setDeleteDialog({ open: false, id: null, name: '' });
      fetchGuests();
      fetchActiveGuests();
    } catch (error) {
      console.error('Error deleting guest:', error);
      setError(error.userMessage || 'Error al eliminar huésped');
      setDeleteDialog({ open: false, id: null, name: '' });
    }
  };

  const filteredGuests = guests.filter((guest) => {
    const matchesSearch = guest.guestName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         guest.guestCedula?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         guest.apartment?.number?.toString().includes(searchTerm);
    const matchesStatus = !statusFilter || guest.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'checked_in': return 'info';
      case 'checked_out': return 'success';
      default: return 'default';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'checked_in': return 'Registrado';
      case 'checked_out': return 'Revisado';
      default: return status;
    }
  };

  const columns = [
    {
      field: 'apartment',
      headerName: 'Apartamento',
      width: 120,
      renderCell: (params) => {
        const apartment = apartments.find(a => a.id === params.row.apartmentId);
        return apartment ? `Torre ${apartment.tower} - Apt ${apartment.number}` : 'N/A';
      },
    },
    {
      field: 'guestName',
      headerName: 'Nombre del Huésped',
      width: 200,
    },
    {
      field: 'guestCedula',
      headerName: 'Cédula',
      width: 150,
    },
    {
      field: 'numberOfGuests',
      headerName: 'N° Huéspedes',
      width: 120,
    },
    {
      field: 'checkInDate',
      headerName: 'Entrada',
      width: 120,
      renderCell: (params) => {
      const date = new Date(params.value);
      return date.toLocaleDateString('es-CO');
      },
    },
    {
      field: 'checkOutDate',
      headerName: 'Salida',
      width: 120,
      renderCell: (params) => {
      const date = new Date(params.value);
      return date.toLocaleDateString('es-CO');
      },
    },
    {
      field: 'status',
      headerName: 'Estado',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={getStatusLabel(params.value)}
          color={getStatusColor(params.value)}
          size="small"
        />
      ),
    },
    ...(user?.role === 'admin' ? [{
      field: 'actions',
      headerName: 'Acciones',
      width: 200,
      renderCell: (params) => (
        <Box>
          <IconButton
            color="primary"
            onClick={() => handleEdit(params.row)}
            title="Editar"
          >
            <Edit />
          </IconButton>
          {params.row.status === 'pending' && (
            <IconButton
              color="success"
              onClick={() => handleCheckIn(params.row.id)}
              title="Check-in"
            >
              <CheckCircle />
            </IconButton>
          )}
          {params.row.status === 'checked_in' && (
            <IconButton
              color="warning"
              onClick={() => handleCheckOut(params.row.id)}
              title="Check-out"
            >
              <CheckCircle />
            </IconButton>
          )}
          <IconButton
            color="error"
            onClick={() => handleDeleteClick(params.row.id, params.row.guestName)}
            title="Eliminar"
          >
            <Delete />
          </IconButton>
        </Box>
      ),
    }] : []),
  ];

  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Gestión Airbnb
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Control de huéspedes Airbnb y check-ins del conjunto residencial
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Hotel sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">Huéspedes Activos</Typography>
              </Box>
              <Typography variant="h3" color="primary">
                {activeGuests.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Person sx={{ mr: 1, color: 'success.main' }} />
                <Typography variant="h6">Total Huéspedes</Typography>
              </Box>
              <Typography variant="h3" color="success.main">
                {guests.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Event sx={{ mr: 1, color: 'warning.main' }} />
                <Typography variant="h6">Entradas Pendientes</Typography>
              </Box>
              <Typography variant="h3" color="warning.main">
                {guests.filter(g => g.status === 'pending').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <AccessTime sx={{ mr: 1, color: 'info.main' }} />
                <Typography variant="h6">Entradas Actuales</Typography>
              </Box>
              <Typography variant="h3" color="info.main">
                {guests.filter(g => g.status === 'checked_in').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
          <TextField
            placeholder="Buscar por nombre, cédula o apartamento"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 350 }}
          />
          <TextField
            select
            label="Filtrar por estado"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            sx={{ minWidth: 160 }}
          >
            <MenuItem value="">Todos</MenuItem>
            <MenuItem value="pending">Pendiente</MenuItem>
            <MenuItem value="checked_in">Entrada</MenuItem>
            <MenuItem value="checked_out">Salida</MenuItem>
          </TextField>
          {user?.role === 'admin' ? (
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => {
                setEditing(null);
                setFormData({
                  apartmentId: '',
                  guestName: '',
                  guestCedula: '',
                  numberOfGuests: 1,
                  checkInDate: '',
                  checkOutDate: '',
                });
                setFormErrors({});
                setFormAlert('');
                setOpen(true);
              }}
            >
              Registrar Huésped
            </Button>
          ) : null}
        </Box>

        <Box sx={{ height: 600 }}>
          <DataGrid
            rows={filteredGuests}
            columns={columns}
            pageSize={10}
            rowsPerPageOptions={[10, 25, 50]}
            loading={loading}
            disableSelectionOnClick
          />
        </Box>
      </Paper>

      <Dialog 
        open={open} 
        onClose={() => {
          setOpen(false);
          setFormErrors({});
          setFormAlert('');
        }} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '16px',
            padding: '8px',
          },
        }}
      >
        <DialogTitle sx={{ textAlign: 'center', color: '#004272', fontWeight: 600 }}>
          {editing ? 'Editar Huésped Airbnb' : 'Registrar Nuevo Huésped Airbnb'}
        </DialogTitle>
        <DialogContent>
          {formAlert && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              {formAlert}
            </Alert>
          )}
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              select
              label="Apartamento"
              value={formData.apartmentId}
              onChange={(e) => {
                setFormData({ ...formData, apartmentId: e.target.value });
                if (formErrors.apartmentId) setFormErrors({ ...formErrors, apartmentId: '' });
              }}
              fullWidth
              required
              error={!!formErrors.apartmentId}
              helperText={formErrors.apartmentId}
            >
              <MenuItem value="">Ninguno</MenuItem>
              {apartments.map((apartment) => (
                <MenuItem key={apartment.id} value={apartment.id}>
                  Torre {apartment.tower} - Piso {apartment.floor} - Apartamento {apartment.number}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Nombre del Huésped"
              value={formData.guestName}
              onChange={(e) => {
                const value = e.target.value.slice(0, 100);
                setFormData({ ...formData, guestName: value });
                if (formErrors.guestName) setFormErrors({ ...formErrors, guestName: '' });
              }}
              fullWidth
              required
              error={!!formErrors.guestName}
              helperText={formErrors.guestName}
              inputProps={{ maxLength: 100 }}
            />
            <TextField
              label="Cédula del Huésped"
              value={formData.guestCedula}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                setFormData({ ...formData, guestCedula: value });
                if (formErrors.guestCedula) setFormErrors({ ...formErrors, guestCedula: '' });
              }}
              fullWidth
              required
              error={!!formErrors.guestCedula}
              helperText={formErrors.guestCedula || 'Entre 7 y 10 dígitos'}
              inputProps={{ maxLength: 10 }}
            />
            <TextField
              label="Número de Huéspedes"
              type="number"
              value={formData.numberOfGuests}
              onChange={(e) => {
                const value = parseInt(e.target.value) || 1;
                setFormData({ ...formData, numberOfGuests: value });
                if (formErrors.numberOfGuests) setFormErrors({ ...formErrors, numberOfGuests: '' });
              }}
              fullWidth
              required
              error={!!formErrors.numberOfGuests}
              helperText={formErrors.numberOfGuests || 'Entre 1 y 20 huéspedes'}
              inputProps={{ min: 1, max: 20 }}
            />
            <TextField
              label="Fecha de entrada"
              type="date"
              value={formData.checkInDate}
              onChange={(e) => {
                setFormData({ ...formData, checkInDate: e.target.value });
                if (formErrors.checkInDate) setFormErrors({ ...formErrors, checkInDate: '' });
                if (formErrors.checkOutDate && formData.checkOutDate) {
                  const checkOut = new Date(formData.checkOutDate);
                  const checkIn = new Date(e.target.value);
                  if (checkOut > checkIn) {
                    setFormErrors({ ...formErrors, checkInDate: '', checkOutDate: '' });
                  }
                }
              }}
              InputLabelProps={{ shrink: true }}
              fullWidth
              required
              error={!!formErrors.checkInDate}
              helperText={formErrors.checkInDate}
            />
            <TextField
              label="Fecha de salida"
              type="date"
              value={formData.checkOutDate}
              onChange={(e) => {
                setFormData({ ...formData, checkOutDate: e.target.value });
                if (formErrors.checkOutDate) setFormErrors({ ...formErrors, checkOutDate: '' });
              }}
              InputLabelProps={{ shrink: true }}
              fullWidth
              required
              error={!!formErrors.checkOutDate}
              helperText={formErrors.checkOutDate || 'Debe ser posterior a la fecha de entrada'}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button 
            onClick={() => {
              setOpen(false);
              setFormErrors({});
              setFormAlert('');
            }}
            variant="outlined"
            sx={{ borderRadius: '8px', textTransform: 'none' }}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleCreate} 
            variant="contained"
            sx={{ borderRadius: '8px', textTransform: 'none' }}
          >
            {editing ? 'Actualizar' : 'Registrar'}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, id: null, name: '' })}
        onConfirm={handleDeleteConfirm}
        title="Eliminar Huésped"
        message={`¿Estás seguro de que quieres eliminar al huésped "${deleteDialog.name}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
      />

      <Snackbar
        open={!!success}
        autoHideDuration={3000}
        onClose={() => setSuccess(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setSuccess(null)} severity="success" sx={{ width: '100%' }}>
          {success}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Airbnb;
