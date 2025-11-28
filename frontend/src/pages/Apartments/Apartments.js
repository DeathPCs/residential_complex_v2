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
  PersonAdd,
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
  const [assignDialog, setAssignDialog] = useState({ open: false, apartment: null });
  const [formErrors, setFormErrors] = useState({});
  const [formAlert, setFormAlert] = useState('');
  const [assignFormData, setAssignFormData] = useState({
    assignedUserId: '',
    assignedRole: '',
  });
  const [formData, setFormData] = useState({
    number: '',
    tower: '',
    floor: '',
    status: '',
    type: '',
    ownerId: '',
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
      setFormData({ number: '', tower: '', floor: '', status: '', type: '' });
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
      setFormData({ number: '', tower: '', floor: '', status: '', type: '' });
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
    });
    setFormErrors({});
    setFormAlert('');
    setOpen(true);
  };

  const handleAssign = (apartment) => {
    setAssignDialog({ open: true, apartment });
    setAssignFormData({
      assignedUserId: apartment.assignedUserId || '',
      assignedRole: apartment.assignedRole || '',
    });
  };

  const handleAssignSubmit = async () => {
    try {
      await updateApartment(assignDialog.apartment.id, {
        ...assignDialog.apartment,
        assignedUserId: assignFormData.assignedUserId,
        assignedRole: assignFormData.assignedRole,
      });
      setSuccess('Usuario asignado exitosamente');
      setAssignDialog({ open: false, apartment: null });
      setAssignFormData({ assignedUserId: '', assignedRole: '' });
      fetchApartments();
    } catch (error) {
      console.error('Error assigning user:', error);
      setError(error.userMessage || 'Error al asignar usuario');
    }
  };

  const filteredApartments = apartments.filter((apartment) => {
    // Only show apartments with status 'rented' or 'owner_occupied' (exclude 'airbnb')
    //if (apartment.status === 'airbnb') return false;

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
        return assignedUser ? assignedUser.name : 'Ninguno';
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
      width: 180,
      renderCell: (params) => (
        <Box>
          <IconButton
            color="primary"
            onClick={() => handleEdit(params.row)}
            title="Editar"
          >
            <Edit />
          </IconButton>
          {params.row.status !== 'airbnb' && (
            <IconButton
              color="secondary"
              onClick={() => handleAssign(params.row)}
              title="Asignar"
            >
              <PersonAdd />
            </IconButton>
          )}
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
      <Box sx={{ mb: 5 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, letterSpacing: '0.03em' }}>
          Apartamentos
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ letterSpacing: '0.01em' }}>
          Gestión completa de apartamentos del conjunto residencial
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
              onClick={fetchApartments}
              sx={{
                fontWeight: 600,
                borderRadius: '12px',
                textTransform: 'none',
                px: 2,
                '&:hover': {
                  backgroundColor: '#003354',
                  color: 'white',
                },
              }}
            >
              Reintentar
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 4, mb: 4, borderRadius: '16px', boxShadow: 6 }}>
        <Box sx={{ display: 'flex', gap: 3, mb: 4, flexWrap: 'wrap' }}>
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
            sx={{ minWidth: 320 }}
          />
          <TextField
            select
            label="Filtrar por estado"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            sx={{ minWidth: 180 }}
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
                setFormData({ number: '', tower: '', floor: '', status: '', type: '' });
                setFormErrors({});
                setFormAlert('');
                setOpen(true);
              }}
              sx={{
                borderRadius: '12px',
                textTransform: 'none',
                transition: 'background-color 0.3s ease',
                '&:hover': {
                  backgroundColor: '#003354',
                },
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
            padding: '16px',
            boxShadow: 6,
          },
        }}
      >
        <DialogTitle sx={{ textAlign: 'center', color: '#004272', fontWeight: 600, letterSpacing: '0.02em' }}>
          {editing ? 'Editar Apartamento' : 'Crear Nuevo Apartamento'}
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
                setFormData({ ...formData, number: e.target.value });
                if (formErrors.number) setFormErrors({ ...formErrors, number: '' });
              }}
              fullWidth
              required
              error={!!formErrors.number}
              helperText={formErrors.number}
            />
            <TextField
              label="Torre"
              value={formData.tower}
              onChange={(e) => {
                setFormData({ ...formData, tower: e.target.value });
                if (formErrors.tower) setFormErrors({ ...formErrors, tower: '' });
              }}
              fullWidth
              required
              error={!!formErrors.tower}
              helperText={formErrors.tower}
            />
            <TextField
              label="Piso"
              type="number"
              value={formData.floor}
              onChange={(e) => {
                setFormData({ ...formData, floor: e.target.value });
                if (formErrors.floor) setFormErrors({ ...formErrors, floor: '' });
              }}
              fullWidth
              required
              error={!!formErrors.floor}
              helperText={formErrors.floor}
            />
            <TextField
              select
              label="Estado"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              fullWidth
              required
            >
              <MenuItem value="owner_occupied">En propiedad</MenuItem>
              <MenuItem value="rented">En Arriendo</MenuItem>
              <MenuItem value="airbnb">Airbnb</MenuItem>
            </TextField>
            <TextField
              select
              label="Tipo"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              fullWidth
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
            sx={{ borderRadius: '12px', textTransform: 'none' }}
          >
            Cancelar
          </Button>
          <Button
            onClick={editing ? handleUpdate : handleCreate}
            variant="contained"
            sx={{
              borderRadius: '12px',
              textTransform: 'none',
              transition: 'background-color 0.3s ease',
              '&:hover': {
                backgroundColor: '#003354',
              },
            }}
          >
            {editing ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={!!success}
        autoHideDuration={3000}
        onClose={() => setSuccess(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        sx={{
          '& .MuiPaper-root': {
            borderRadius: '12px',
            boxShadow: 6,
          },
        }}
      >
        <Alert onClose={() => setSuccess(null)} severity="success" sx={{ width: '100%', borderRadius: '12px' }}>
          {success}
        </Alert>
      </Snackbar>

      <ConfirmDialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, id: null, number: '' })}
        onConfirm={handleDeleteConfirm}
        title="Eliminar Apartamento"
        message={`¿Estás seguro de que quieres eliminar el apartamento "${deleteDialog.number}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
      />

      <Dialog
        open={assignDialog.open}
        onClose={() => {
          setAssignDialog({ open: false, apartment: null });
          setAssignFormData({ assignedUserId: '', assignedRole: '' });
        }}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '16px',
            padding: '16px',
            boxShadow: 6,
          },
        }}
      >
        <DialogTitle sx={{ textAlign: 'center', color: '#004272', fontWeight: 600, letterSpacing: '0.02em' }}>
          Asignar Usuario al Apartamento
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              select
              label="Usuario"
              value={assignFormData.assignedUserId}
              onChange={(e) => setAssignFormData({ ...assignFormData, assignedUserId: e.target.value })}
              fullWidth
              required
            >
              <MenuItem value="">Seleccionar Usuario</MenuItem>
              {users.filter((user) => user.role !== 'airbnb').map((user) => (
                <MenuItem key={user.id} value={user.id}>
                  {user.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Rol"
              value={assignFormData.assignedRole}
              onChange={(e) => setAssignFormData({ ...assignFormData, assignedRole: e.target.value })}
              fullWidth
              required
            >
              <MenuItem value="owner">Propietario</MenuItem>
              <MenuItem value="tenant">Inquilino</MenuItem>
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => {
              setAssignDialog({ open: false, apartment: null });
              setAssignFormData({ assignedUserId: '', assignedRole: '' });
            }}
            variant="outlined"
            sx={{ borderRadius: '12px', textTransform: 'none' }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleAssignSubmit}
            variant="contained"
            sx={{
              borderRadius: '12px',
              textTransform: 'none',
              transition: 'background-color 0.3s ease',
              '&:hover': {
                backgroundColor: '#003354',
              },
            }}
          >
            Asignar
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Apartments;
