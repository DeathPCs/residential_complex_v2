import React, { useEffect, useState, useContext, useRef } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Paper,
  InputAdornment,
  Alert,
  Chip,
  IconButton,
  Snackbar,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import {
  Add,
  Search,
  Edit,
  Delete,
  Refresh,
  CheckCircle,
} from '@mui/icons-material';
import api, { updateEvent, deleteEvent, updateMaintenanceStatus } from '../../services/api';
import Loading from '../../components/common/Loading';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { AuthContext } from '../../context/AuthContext';

const Maintenance = () => {
  const { user } = useContext(AuthContext);
  const [maintenances, setMaintenances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null, title: '' });
  const [formErrors, setFormErrors] = useState({});
  const [formAlert, setFormAlert] = useState('');
  const fetchInProgress = useRef(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    area: '',
    scheduledDate: '',
    completedDate: '',
    priority: '',
  });

  useEffect(() => {
    fetchMaintenances();
  }, []);

  const fetchMaintenances = async () => {
    // Prevenir múltiples llamadas concurrentes
    if (fetchInProgress.current) return;
    fetchInProgress.current = true;
    
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/maintenance');
      setMaintenances(response.data.data || []);
    } catch (error) {
      console.error('Error fetching maintenances:', error);
      setError(error.userMessage || 'Error al cargar mantenimientos');
      setMaintenances([]);
    } finally {
      setLoading(false);
      fetchInProgress.current = false;
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.title.trim()) {
      errors.title = 'El título es requerido';
    } else if (formData.title.trim().length < 3) {
      errors.title = 'El título debe tener al menos 3 caracteres';
    } else if (formData.title.trim().length > 200) {
      errors.title = 'El título no puede exceder 200 caracteres';
    }
    
    if (!formData.description.trim()) {
      errors.description = 'La descripción es requerida';
    } else if (formData.description.trim().length < 10) {
      errors.description = 'La descripción debe tener al menos 10 caracteres';
    } else if (formData.description.trim().length > 1000) {
      errors.description = 'La descripción no puede exceder 1000 caracteres';
    }
    
    if (!formData.area) {
      errors.area = 'El área es requerida';
    }
    
    if (!formData.scheduledDate) {
      errors.scheduledDate = 'La fecha programada es requerida';
    }
    
    if (!formData.priority) {
      errors.priority = 'La prioridad es requerida';
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
      await api.post('/maintenance', formData);
      setSuccess('Mantenimiento creado exitosamente');
      setOpen(false);
      setFormData({ title: '', description: '', area: '', scheduledDate: '', completedDate: '', priority: ''});
      setFormErrors({});
      setFormAlert('');
      fetchMaintenances();
    } catch (error) {
      console.error('Error creating maintenance:', error);
      setError(error.userMessage || 'Error al crear mantenimiento');
    }
  };

  const handleUpdate = async () => {
    if (!validateForm()) {
      return;
    }
    
    try {
      await updateEvent(editing.id, formData);
      setSuccess('Mantenimiento actualizado exitosamente');
      setOpen(false);
      setEditing(null);
      setFormData({ title: '', description: '', area: '', scheduledDate: '', completedDate: '', priority: '' });
      setFormErrors({});
      setFormAlert('');
      fetchMaintenances();
    } catch (error) {
      console.error('Error updating maintenance:', error);
      setError(error.userMessage || 'Error al actualizar mantenimiento');
    }
  };

  const handleDeleteClick = (id, title) => {
    setDeleteDialog({ open: true, id, title });
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteEvent(deleteDialog.id);
      setSuccess('Mantenimiento eliminado exitosamente');
      setDeleteDialog({ open: false, id: null, title: '' });
      fetchMaintenances();
    } catch (error) {
      console.error('Error deleting maintenance:', error);
      setError(error.userMessage || 'Error al eliminar mantenimiento');
      setDeleteDialog({ open: false, id: null, title: '' });
    }
  };

  const handleEdit = (maintenance) => {
    setEditing(maintenance);
    setFormData({
      title: maintenance.title,
      description: maintenance.description,
      area: maintenance.area,
      scheduledDate: maintenance.scheduledDate ? maintenance.scheduledDate.split('T')[0] : '',
      completedDate: maintenance.completedDate ? maintenance.completedDate.split('T')[0] : '',
      priority: maintenance.priority || '',
    });
    setFormErrors({});
    setFormAlert('');
    setOpen(true);
  };

  const handleStatusToggle = async (id, currentStatus) => {
    if (currentStatus === 'completed') return; // No permitir cambiar de completado

    const nextStatus = currentStatus === 'pending' ? 'in_progress' : 'completed';

    // Optimistically update the local state
    setMaintenances(prev => prev.map(m => m.id === id ? { ...m, status: nextStatus } : m));

    try {
      await updateMaintenanceStatus(id, nextStatus);
      setSuccess('Estado del mantenimiento actualizado exitosamente');
    } catch (error) {
      // Revert the change on error
      setMaintenances(prev => prev.map(m => m.id === id ? { ...m, status: currentStatus } : m));
      console.error('Error updating status:', error);
      setError(error.userMessage || 'Error al actualizar estado');
    }
  };

  const filteredMaintenances = maintenances.filter((maintenance) => {
    const matchesSearch = maintenance.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         maintenance.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         maintenance.area?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'in_progress': return 'info';
      case 'completed': return 'success';
      default: return 'default';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'in_progress': return 'En Progreso';
      case 'completed': return 'Completado';
      default: return status;
    }
  };

  const columns = [
    {
      field: 'title',
      headerName: 'Título',
      width: 200,
    },
    {
      field: 'description',
      headerName: 'Descripción',
      width: 300,
    },
    {
      field: 'area',
      headerName: 'Área',
      width: 150,
    },
    {
      field: 'status',
      headerName: 'Estado',
      width: 150,
      renderCell: (params) => (
        <Chip
          label={getStatusLabel(params.value)}
          color={getStatusColor(params.value)}
          size="small"
        />
      ),
    },
    {
      field: 'scheduledDate',
      headerName: 'Fecha Programada',
      width: 150,
      renderCell: (params) => {
        const date = new Date(params.value);
        return date.toLocaleDateString('es-CO');
      },
    },
    {
      field: 'completedDate',
      headerName: 'Fecha Completada',
      width: 150,
      renderCell: (params) => {
        const date = new Date(params.value);
        return date.toLocaleDateString('es-CO');
      },
    },
    {
      field: 'priority',
      headerName: 'Prioridad',
      width: 100,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={
            params.value === 'high' ? 'error' :
            params.value === 'medium' ? 'warning' : 'default'
          }
          size="small"
        />
      ),
    },
    ...(user?.role === 'admin' ? [{
      field: 'actions',
      headerName: 'Acciones',
      width: 200,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          {params.row.status !== 'completed' && (
            <IconButton
              color="success"
              onClick={() => handleStatusToggle(params.row.id, params.row.status)}
              title={params.row.status === 'pending' ? 'Iniciar' : 'Completar'}
            >
              <CheckCircle />
            </IconButton>
          )}
          <IconButton
            color="primary"
            onClick={() => handleEdit(params.row)}
            title="Editar"
          >
            <Edit />
          </IconButton>
          <IconButton
            color="error"
            onClick={() => handleDeleteClick(params.row.id, params.row.title)}
            title="Eliminar"
          >
            <Delete />
          </IconButton>
        </Box>
      ),
    }] : []),
  ];

  if (loading) {
    return <Loading message="Cargando mantenimientos..." />;
  }

  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
           Mantenimientos
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Gestión de solicitudes de mantenimiento del conjunto residencial
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
              onClick={fetchMaintenances}
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
            placeholder="Buscar por título, descripción o área"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
            sx={{
              minWidth: 300,
              '& .MuiOutlinedInput-root': {
                borderRadius: '10px',
                backgroundColor: '#f7fafd',
              },
            }}
          />
          {user?.role === 'admin' && (
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => {
                setEditing(null);
                setFormData({ title: '', description: '', area: '', scheduledDate: '', completedDate: '', priority: '' });
              setFormErrors({});
              setFormAlert('');
                setOpen(true);
              }}
              sx={{
                backgroundColor: '#004272',
                '&:hover': { backgroundColor: '#002a4a' },
                borderRadius: '8px',
              }}
            >
              Agregar mantenimiento
            </Button>
          )}
        </Box>

        <Box sx={{ height: 600 }}>
          <DataGrid
            rows={filteredMaintenances}
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
          {editing ? 'Editar Mantenimiento' : 'Registrar Mantenimiento'}
        </DialogTitle>
        <DialogContent>
          {formAlert && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              {formAlert}
            </Alert>
          )}
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Título"
              value={formData.title}
              onChange={(e) => {
                const value = e.target.value.slice(0, 200);
                setFormData({ ...formData, title: value });
                if (formErrors.title) setFormErrors({ ...formErrors, title: '' });
              }}
              fullWidth
              required
              error={!!formErrors.title}
              helperText={formErrors.title || 'Mínimo 3 caracteres, máximo 200'}
              inputProps={{ maxLength: 200 }}
            />
            <TextField
              label="Descripción"
              value={formData.description}
              onChange={(e) => {
                const value = e.target.value.slice(0, 1000);
                setFormData({ ...formData, description: value });
                if (formErrors.description) setFormErrors({ ...formErrors, description: '' });
              }}
              multiline
              rows={3}
              fullWidth
              required
              error={!!formErrors.description}
              helperText={formErrors.description || 'Mínimo 10 caracteres, máximo 1000'}
              inputProps={{ maxLength: 1000 }}
            />
            <TextField
              label="Área"
              value={formData.area}
              onChange={(e) => {
                const value = e.target.value.slice(0, 100);
                setFormData({ ...formData, area: value });
                if (formErrors.area) setFormErrors({ ...formErrors, area: '' });
              }}
              placeholder="Piscina, gym, elevador, áreas comunes, jardines..."
              fullWidth
              required
              error={!!formErrors.area}
              helperText={formErrors.area || 'Máximo 100 caracteres'}
              inputProps={{ maxLength: 100 }}
            />
            <TextField
              label="Fecha programada"
              type="date"
              value={formData.scheduledDate}
              onChange={(e) => {
                setFormData({ ...formData, scheduledDate: e.target.value });
                if (formErrors.scheduledDate) setFormErrors({ ...formErrors, scheduledDate: '' });
              }}
              InputLabelProps={{ shrink: true }}
              fullWidth
              required
              error={!!formErrors.scheduledDate}
              helperText={formErrors.scheduledDate}
            />
            <TextField
              label="Fecha completada"
              type="date"
              value={formData.completedDate}
              onChange={(e) => {
                setFormData({ ...formData, completedDate: e.target.value });
              }}
              InputLabelProps={{ shrink: true }}
              fullWidth
              helperText="Opcional"
            />
            <TextField
              select
              label="Prioridad"
              value={formData.priority}
              onChange={(e) => {
                setFormData({ ...formData, priority: e.target.value });
                if (formErrors.priority) setFormErrors({ ...formErrors, priority: '' });
              }}
              fullWidth
              required
              error={!!formErrors.priority}
              helperText={formErrors.priority}
            >
              <MenuItem value="low">Baja</MenuItem>
              <MenuItem value="medium">Media</MenuItem>
              <MenuItem value="high">Alta</MenuItem>
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
            sx={{ borderRadius: '8px', textTransform: 'none' }}
          >
            Cancelar
          </Button>
          <Button
            onClick={editing ? handleUpdate : handleCreate}
            variant="contained"
            sx={{ borderRadius: '8px', textTransform: 'none' }}
          >
            {editing ? 'Actualizar' : 'Guardar'}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, id: null, title: '' })}
        onConfirm={handleDeleteConfirm}
        title="Eliminar Mantenimiento"
        message={`¿Estás seguro de que quieres eliminar el mantenimiento "${deleteDialog.title}"? Esta acción no se puede deshacer.`}
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

export default Maintenance;