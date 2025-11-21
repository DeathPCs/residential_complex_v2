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
  Chip,
  Paper,
  InputAdornment,
  IconButton,
  Alert,
  Snackbar,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import {
  Add,
  Search,
  Edit,
  CheckCircle,
  Delete,
} from '@mui/icons-material';
import api, { updateDamageReportStatus } from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import Loading from '../../components/common/Loading';
import ConfirmDialog from '../../components/common/ConfirmDialog';

const DamageReports = () => {
  const { user } = useContext(AuthContext);
  const [reports, setReports] = useState([]);
  const [apartments, setApartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null, title: '' });
  const [formErrors, setFormErrors] = useState({});
  const [formAlert, setFormAlert] = useState('');
  const fetchInProgress = useRef(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: '',
    apartmentId: '',
    reportedBy: '',
  });

  useEffect(() => {
    fetchReports();
    fetchApartments();
  }, []);

  const fetchApartments = async () => {
    try {
      const response = await api.get('/apartments');
      setApartments(response.data.data || []);
    } catch (error) {
      console.error('Error fetching apartments:', error);
    }
  };

  const fetchReports = async () => {
    // Prevenir múltiples llamadas concurrentes
    if (fetchInProgress.current) return;
    fetchInProgress.current = true;
    
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/damage-reports/my-reports');
      setReports(response.data.data || []);
    } catch (error) {
      console.error('Error fetching damage reports:', error);
      setError(error.userMessage || 'Error al cargar reportes de daños');
      setReports([]);
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
    
    if (!formData.priority) {
      errors.priority = 'La prioridad es requerida';
    }
    
    if (!formData.apartmentId) {
      errors.apartmentId = 'El apartamento es requerido';
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
        await api.put(`/damage-reports/${editing.id}`, formData);
        setSuccess('Reporte de daño actualizado exitosamente');
      } else {
        await api.post('/damage-reports', formData);
        setSuccess('Reporte de daño creado exitosamente');
      }
      setOpen(false);
      setEditing(null);
      setFormData({ title: '', description: '', priority: '', apartmentId: '', reportedBy: '' });
      setFormErrors({});
      setFormAlert('');
      setFormAlert('');
      fetchReports();
    } catch (error) {
      console.error('Error creating/updating damage report:', error);
      setError(error.userMessage || 'Error al crear/actualizar reporte de daño');
    }
  };

  const handleEdit = (report) => {
    setEditing(report);
    setFormData({
      title: report.title,
      description: report.description,
      priority: report.priority,
      apartmentId: report.apartmentId,
      reportedBy: report.reportedBy,
    });
    setFormErrors({});
    setFormAlert('');
    setOpen(true);
  };

  const handleDeleteClick = (id, title) => {
    setDeleteDialog({ open: true, id, title });
  };

  const handleDeleteConfirm = async () => {
    try {
      await api.delete(`/damage-reports/${deleteDialog.id}`);
      setSuccess('Reporte de daño eliminado exitosamente');
      setDeleteDialog({ open: false, id: null, title: '' });
      fetchReports();
    } catch (error) {
      console.error('Error deleting damage report:', error);
      setError(error.userMessage || 'Error al eliminar reporte de daño');
      setDeleteDialog({ open: false, id: null, title: '' });
    }
  };

  const handleStatusToggle = async (id, currentStatus) => {
    if (currentStatus === 'resolved') return; // No permitir cambiar de resuelto

    const statusCycle = ['reported', 'acknowledged', 'in_progress', 'resolved'];
    const currentIndex = statusCycle.indexOf(currentStatus);
    const nextStatus = statusCycle[currentIndex + 1];

    if (nextStatus) {
      // Optimistically update the local state
      setReports(prev => prev.map(r => r.id === id ? { ...r, status: nextStatus } : r));

      try {
        await updateDamageReportStatus(id, nextStatus);
        setSuccess('Estado del reporte actualizado exitosamente');
      } catch (error) {
        // Revert the change on error
        setReports(prev => prev.map(r => r.id === id ? { ...r, status: currentStatus } : r));
        console.error('Error updating damage report status:', error);
        setError(error.userMessage || 'Error al actualizar estado del reporte de daño');
      }
    }
  };

  const filteredReports = reports.filter((report) => {
    const matchesSearch = report.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.apartment?.number?.toString().includes(searchTerm);
    const matchesStatus = !statusFilter || report.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'reported': return 'warning';
      case 'acknowledged': return 'normal';
      case 'in_progress': return 'info';
      case 'resolved': return 'success'
      default: return 'default';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'reported': return 'Reportado';
      case 'acknowledged': return 'Admitido';
      case 'in_progress': return 'En Progreso';
      case 'resolved': return 'Resuelto'
      default: return status;
    }
  };

  const getPriorityColor = (status) => {
    switch (status) {
      case 'low': return 'normal';
      case 'medium': return 'warning';
      case 'high': return 'warning';
      case 'urgent': return 'error';
      default: return 'default';
    }
  };

  const getPriorityLabel = (status) => {
    switch (status) {
      case 'low': return 'Baja';
      case 'medium': return 'Media';
      case 'high': return 'Alta';
      case 'urgent': return 'Urgente';
      default: return status;
    }
  };

  const columns = [
    {
      field: 'apartment',
      headerName: 'Apartamento',
      width: 190,
      renderCell: (params) => {
        const apartment = apartments.find(a => a.id === params.row.apartmentId);
        return apartment ? `Torre ${apartment.tower} - Apt. ${apartment.number} ` : 'N/A';
      },
    },
    {
      field: 'reportedBy',
      headerName: 'Reportero',
      width: 100,
      renderCell: (params) => {
        return params.row.reporter ? `${params.row.reporter.name}` : 'N/A';
      }
    },
    {
      field: 'title',
      headerName: 'Título',
      width: 100,
    },
    {
      field: 'description',
      headerName: 'Descripción',
      width: 250,
      flex: 1,
    },
    {
      field: 'priority',
      headerName: 'Prioridad',
      width: 100,
      renderCell: (params) => (
      <Chip
        label={getPriorityLabel(params.value)}
        color={getPriorityColor(params.value)}
        size="small"
      />
    ),
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
    {
      field: 'createdAt',
      headerName: 'Fecha Creación',
      width: 150,
      renderCell: (params) => {
      const date = new Date(params.value);
      return date.toLocaleDateString('es-CO');
      },
    },
    ...(user?.role === 'admin' ? [{
      field: 'actions',
      headerName: 'Acciones',
      width: 200,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          {params.row.status !== 'resolved' && (
            <IconButton
              size="small"
              onClick={() => handleStatusToggle(params.row.id, params.row.status)}
              color="success"
              title={
                params.row.status === 'reported' ? 'Admitir' :
                params.row.status === 'acknowledged' ? 'Iniciar' :
                params.row.status === 'in_progress' ? 'Resolver' : 'Cambiar Estado'
              }
            >
              <CheckCircle />
            </IconButton>
          )}
          <IconButton
            size="small"
            onClick={() => handleEdit(params.row)}
            color="primary"
          >
            <Edit />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => handleDeleteClick(params.row.id, params.row.title)}
            color="error"
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
          Reportes de Daños
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Reportes de daños y problemas en el conjunto residencial
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
          <TextField
            placeholder="Buscar por título, descripción o apartamento"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 370 }}
          />
          <TextField
            select
            label="Filtrar por estado"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            sx={{ minWidth: 160 }}
          >
            <MenuItem value="">Todos</MenuItem>
            <MenuItem value="reported">Reportado</MenuItem>
            <MenuItem value="acknowledged">Admitido</MenuItem>
            <MenuItem value="in_progress">En Progreso</MenuItem>
            <MenuItem value="resolved">Resuelto</MenuItem>
          </TextField>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => {
              setEditing(null);
              setFormData({ title: '', description: '', priority: '', apartmentId: '', reportedBy: '' });
              setFormErrors({});
              setFormAlert('');
              setOpen(true);
            }}
          >
            Nuevo Reporte
          </Button>
        </Box>

        <Box sx={{ height: 600 }}>
          <DataGrid
            rows={filteredReports}
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
          {editing ? 'Editar Reporte de Daño' : 'Nuevo Reporte de Daño'}
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
              {apartments.map((apartment) => (
                <MenuItem key={apartment.id} value={apartment.id}>
                  Torre {apartment.tower} - Piso {apartment.floor} - Apartamento {apartment.number}
                </MenuItem>
              ))}
            </TextField>
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
              <MenuItem value="urgent">Urgente</MenuItem>
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
            onClick={handleCreate} 
            variant="contained"
            sx={{ borderRadius: '8px', textTransform: 'none' }}
          >
            {editing ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, id: null, title: '' })}
        onConfirm={handleDeleteConfirm}
        title="Eliminar Reporte"
        message={`¿Estás seguro de que quieres eliminar el reporte "${deleteDialog.title}"? Esta acción no se puede deshacer.`}
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

export default DamageReports;
