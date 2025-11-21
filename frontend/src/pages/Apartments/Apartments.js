import React, { useEffect, useState, useContext, useRef } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Paper,
  InputAdornment,
  IconButton,
  Alert,
  Fab,
  Snackbar,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import {
  Add,
  Search,
  Edit,
  Delete,
  Refresh,
} from '@mui/icons-material';
import { getApartments, createApartment, updateApartment, deleteApartment, getUsers } from '../../services/api';
import Loading from '../../components/common/Loading';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { AuthContext } from '../../context/AuthContext';

const Apartments = () => {
  const { user } = useContext(AuthContext);
  const [apartments, setApartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null, number: '' });
  const [formErrors, setFormErrors] = useState({});
  const [formAlert, setFormAlert] = useState('');
  const [formData, setFormData] = useState({
    number: '',
    tower: '',
    floor: '',
    status: 'owner_occupied',
    type: '',
    assignedUserId: '',
    ownerId: '',
    assignedRole: '',
  });
  const [users, setUsers] = useState([]);
  const fetchInProgress = useRef(false);

  useEffect(() => {
    fetchApartments();
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await getUsers();
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchApartments = async () => {
    if (fetchInProgress.current) return; // Prevent multiple concurrent calls
    fetchInProgress.current = true;
    try {
      setLoading(true);
      setError(null);
      const data = await getApartments();
      setApartments(data || []);
    } catch (error) {
      console.error('Error fetching apartments:', error);
      setError(error.userMessage || 'Error al cargar apartamentos');
    } finally {
      setLoading(false);
      fetchInProgress.current = false;
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.number.trim()) {
      errors.number = 'El número es requerido';
    } else if (formData.number.trim().length > 20) {
      errors.number = 'El número no puede exceder 20 caracteres';
    }
    
    if (!formData.tower.trim()) {
      errors.tower = 'La torre es requerida';
    } else if (formData.tower.trim().length > 50) {
      errors.tower = 'La torre no puede exceder 50 caracteres';
    }
    
    if (!formData.floor || formData.floor === '') {
      errors.floor = 'El piso es requerido';
    } else {
      const floorNum = parseInt(formData.floor);
      if (isNaN(floorNum) || floorNum < 1 || floorNum > 200) {
        errors.floor = 'El piso debe ser un número entre 1 y 200';
      }
    }
    
    if (formData.type && formData.type.length > 50) {
      errors.type = 'El tipo no puede exceder 50 caracteres';
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
      await createApartment(formData);
      setSuccess('Apartamento creado exitosamente');
      setOpen(false);
      setFormData({ number: '', tower: '', floor: '', status: 'owner_occupied', type: '', assignedUserId: '', assignedRole: '' });
      setFormErrors({});
      setFormAlert('');
      fetchApartments();
    } catch (error) {
      console.error('Error creating apartment:', error);
      setError(error.userMessage || 'Error al crear apartamento');
    }
  };

  const handleUpdate = async () => {
    if (!validateForm()) {
      return;
    }
    
    try {
      await updateApartment(editing.id, formData);
      setSuccess('Apartamento actualizado exitosamente');
      setOpen(false);
      setEditing(null);
      setFormData({ number: '', tower: '', floor: '', status: 'owner_occupied', type: '', assignedUserId: '', assignedRole: '' });
      setFormErrors({});
      setFormAlert('');
      fetchApartments();
    } catch (error) {
      console.error('Error updating apartment:', error);
      setError(error.userMessage || 'Error al actualizar apartamento');
    }
  };

  const handleDeleteClick = (id, number) => {
    setDeleteDialog({ open: true, id, number });
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteApartment(deleteDialog.id);
      setSuccess('Apartamento eliminado exitosamente');
      setDeleteDialog({ open: false, id: null, number: '' });
      fetchApartments();
    } catch (error) {
      console.error('Error deleting apartment:', error);
      setError(error.userMessage || 'Error al eliminar apartamento');
      setDeleteDialog({ open: false, id: null, number: '' });
    }
  };

  const handleEdit = (apartment) => {
    setEditing(apartment);
    setFormData({
      number: apartment.number,
      tower: apartment.tower,
      floor: apartment.floor,
      status: apartment.status,
      type: apartment.type,
      assignedUserId: apartment.assignedUserId || '',
      assignedRole: apartment.assignedRole || '',
    });
    setFormErrors({});
    setFormAlert('');
    setOpen(true);
  };

  const filteredApartments = apartments.filter((apartment) => {
    const matchesSearch = apartment.number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         apartment.tower?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (apartment.owner && apartment.owner.name ? apartment.owner.name.toLowerCase().includes(searchTerm.toLowerCase()) : false);
    const matchesStatus = !statusFilter || apartment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'owner_occupied': return 'primary';
      case 'rented': return 'warning';
      case 'airbnb': return 'info';
      default: return 'default';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'owner_occupied': return 'Propiedad';
      case 'rented': return 'Arriendo';
      case 'airbnb': return 'Airbnb';
      default: return status;
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'studioApartment': return 'Apartaestudio';
      case 'oneApartment': return 'Apartamento de 1 habitación';
      case 'twoApartment': return 'Apartamento de 2 habitaciones';
      case 'threeApartment': return 'Apartamento de 3 habitaciones';
      case 'duplex': return 'Dúplex';
      case 'penthouse': return 'Penthouse';
      case 'loft': return 'Loft';
      case 'gardenApartment': return 'Apartamento jardín';
      default: return type;
    }
  };

  const columns = [
    {
      field: 'number',
      headerName: 'Número',
      width: 70,
    },
    {
      field: 'tower',
      headerName: 'Torre',
      width: 55,
    },
    {
      field: 'floor',
      headerName: 'Piso',
      width: 10,
      type: 'number',
    },
    {
      field: 'owner',
      headerName: 'Propietario',
      width: 200,
      renderCell: (params) => {
        const assignedUser = params.row.assignedUser;
        return assignedUser ? assignedUser.name : 'N/A';
      },
    },
    {
      field: 'type',
      headerName: 'Tipo',
      width: 200,
      renderCell: (params) => getTypeLabel(params.value),
    },
    {
      field: 'status',
      headerName: 'Estado',
      width: 100,
      renderCell: (params) => (
        <Chip
          label={getStatusLabel(params.value)}
          color={getStatusColor(params.value)}
          size="small"
        />
      ),
    },
    {
      field: 'createdAt',
      headerName: 'Fecha Registro',
      width: 120,
      renderCell: (params) => {
      const date = new Date(params.value);
      return date.toLocaleDateString('es-CO');
      },
    },
    ...(user?.role === 'admin' ? [{
      field: 'actions',
      headerName: 'Acciones',
      width: 120,
      renderCell: (params) => (
        <Box>
          <IconButton
            color="primary"
            onClick={() => handleEdit(params.row)}
            title="Editar"
          >
            <Edit />
          </IconButton>
          <IconButton
            color="error"
            onClick={() => handleDeleteClick(params.row.id, params.row.number)}
            title="Eliminar"
          >
            <Delete />
          </IconButton>
        </Box>
      ),
    }] : []),
  ];

  if (loading) {
    return <Loading message="Cargando apartamentos..." />;
  }

  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Apartamentos
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Gestión completa de apartamentos del conjunto residencial
        </Typography>
      </Box>

      {error && (
        <Alert
          severity="error"
          sx={{ mb: 3 }}
          action={
            <Button
              color="inherit"
              size="small"
              startIcon={<Refresh />}
              onClick={fetchApartments}
            >
              Reintentar
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
          <TextField
            placeholder="Buscar por número, torre o propietario"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 300 }}
          />
          <TextField
            select
            label="Filtrar por estado"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            sx={{ minWidth: 160 }}
          >
            <MenuItem value="">Todos</MenuItem>
            <MenuItem value="owner_occupied">En propiedad</MenuItem>
            <MenuItem value="rented">En Arriendo</MenuItem>
            <MenuItem value="airbnb">Airbnb</MenuItem>
          </TextField>
          {user?.role === 'admin' && (
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => {
                setEditing(null);
                setFormData({ number: '', tower: '', floor: '', status: 'owner_occupied', type: '', assignedUserId: '', assignedRole: '' });
                setFormErrors({});
                setFormAlert('');
                setOpen(true);
              }}
            >
              Nuevo Apartamento
            </Button>
          )}
        </Box>

        <Box sx={{ height: 600 }}>
          <DataGrid
            rows={filteredApartments}
            columns={columns}
            pageSize={10}
            rowsPerPageOptions={[10, 25, 50]}
            loading={loading}
            disableSelectionOnClick
          />
        </Box>
      </Paper>

      <Dialog open={open} onClose={() => {
        setOpen(false);
        setFormErrors({});
        setFormAlert('');
      }} maxWidth="sm" fullWidth
        PaperProps={{
          sx: {
            borderRadius: '16px',
            padding: '8px',
          },
        }}
      >
        <DialogTitle sx={{ textAlign: 'center', color: '#004272', fontWeight: 600 }}>
          {editing ? 'Editar Apartamento' : 'Nuevo Apartamento'}
        </DialogTitle>
        <DialogContent>
          {formAlert && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              {formAlert}
            </Alert>
          )}
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Número"
              value={formData.number}
              onChange={(e) => {
                const value = e.target.value.slice(0, 20);
                setFormData({ ...formData, number: value });
                if (formErrors.number) setFormErrors({ ...formErrors, number: '' });
              }}
              fullWidth
              required
              error={!!formErrors.number}
              helperText={formErrors.number}
              inputProps={{ maxLength: 20 }}
            />
            <TextField
              label="Torre"
              value={formData.tower}
              onChange={(e) => {
                const value = e.target.value.slice(0, 50);
                setFormData({ ...formData, tower: value });
                if (formErrors.tower) setFormErrors({ ...formErrors, tower: '' });
              }}
              fullWidth
              required
              error={!!formErrors.tower}
              helperText={formErrors.tower}
              inputProps={{ maxLength: 50 }}
            />
            <TextField
              label="Piso"
              type="text"
              value={formData.floor}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 3);
                setFormData({ ...formData, floor: value });
                if (formErrors.floor) setFormErrors({ ...formErrors, floor: '' });
              }}
              fullWidth
              required
              error={!!formErrors.floor}
              helperText={formErrors.floor}
              inputProps={{ inputMode: 'numeric', pattern: '[0-9]*', maxLength: 3 }}
            />
            <TextField
              select
              label="Tipo"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              fullWidth
              placeholder="Ej: Familiar, estudio, etc.."
            >
            <MenuItem value="">Ninguno</MenuItem>
            <MenuItem value="studioApartment">Apartaestudio</MenuItem>
            <MenuItem value="oneApartment">Apartamento de 1 habitación</MenuItem>
            <MenuItem value="twoApartment">Apartamento de 2 habitaciones</MenuItem>
            <MenuItem value="threeApartment">Apartamento de 3 habitaciones</MenuItem>
            <MenuItem value="duplex">Dúplex</MenuItem>
            <MenuItem value="penthouse">Penthouse</MenuItem>
            <MenuItem value="loft">Loft</MenuItem>
            <MenuItem value="gardenApartment">Apartamento jardín</MenuItem>
          </TextField>
            <TextField
              select
              label="Asignar Usuario"
              value={formData.assignedUserId}
              onChange={(e) => setFormData({ ...formData, assignedUserId: e.target.value })}
              fullWidth
            >
              <MenuItem value="">Ninguno</MenuItem>
              {users.map((user) => (
                <MenuItem key={user.id} value={user.id}>
                  {user.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Rol Asignado"
              value={formData.assignedRole}
              onChange={(e) => setFormData({ ...formData, assignedRole: e.target.value })}
              fullWidth
            >
              <MenuItem value="">Ninguno</MenuItem>
              <MenuItem value="owner">Propietario</MenuItem>
              <MenuItem value="tenant">Arrendatario</MenuItem>
              <MenuItem value="airbnb_guest">Huésped Airbnb</MenuItem>
            </TextField>
            <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', mt: 2, mb: 2 }}>
              <Button
                variant={formData.status === 'owner_occupied' ? 'contained' : 'outlined'}
                onClick={() => setFormData({ ...formData, status: 'owner_occupied' })}
                sx={{
                  flex: 1,
                  mr: 1,
                  borderRadius: '8px',
                  backgroundColor: formData.status === 'owner_occupied' ? '#004272' : '#fff',
                  color: formData.status === 'owner_occupied' ? '#fff' : '#004272',
                  borderColor: '#004272',
                  '&:hover': {
                    backgroundColor: formData.status === 'owner_occupied' ? '#002a4a' : '#f0f4f8',
                  },
                }}
              >
                Propiedad
              </Button>
              <Button
                variant={formData.status === 'rented' ? 'contained' : 'outlined'}
                onClick={() => setFormData({ ...formData, status: 'rented' })}
                sx={{
                  flex: 1,
                  mr: 1,
                  borderRadius: '8px',
                  backgroundColor: formData.status === 'rented' ? '#004272' : '#fff',
                  color: formData.status === 'rented' ? '#fff' : '#004272',
                  borderColor: '#004272',
                  '&:hover': {
                    backgroundColor: formData.status === 'rented' ? '#002a4a' : '#f0f4f8',
                  },
                }}
              >
                Arriendo
              </Button>
              <Button
                variant={formData.status === 'airbnb' ? 'contained' : 'outlined'}
                onClick={() => setFormData({ ...formData, status: 'airbnb' })}
                sx={{
                  flex: 1,
                  borderRadius: '8px',
                  backgroundColor: formData.status === 'airbnb' ? '#004272' : '#fff',
                  color: formData.status === 'airbnb' ? '#fff' : '#004272',
                  borderColor: '#004272',
                  '&:hover': {
                    backgroundColor: formData.status === 'airbnb' ? '#002a4a' : '#f0f4f8',
                  },
                }}
              >
                Airbnb
              </Button>
            </Box>
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
            onClick={editing ? handleUpdate : handleCreate} 
            variant="contained"
            sx={{ borderRadius: '8px', textTransform: 'none' }}
          >
            {editing ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, id: null, number: '' })}
        onConfirm={handleDeleteConfirm}
        title="Eliminar Apartamento"
        message={`¿Estás seguro de que quieres eliminar el apartamento "${deleteDialog.number}"? Esta acción no se puede deshacer.`}
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

export default Apartments;
