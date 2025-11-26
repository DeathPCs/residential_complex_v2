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
  Delete,
  CheckCircle,
  Refresh,
} from '@mui/icons-material';
import { getUsers, getApartments, getPayments, registerPaymentAsPaid, createPayment, updatePayment, deletePayment } from '../../services/api';
import Loading from '../../components/common/Loading';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { AuthContext } from '../../context/AuthContext';

const Payments = () => {
  const { user } = useContext(AuthContext);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState([]);
  const [apartments, setApartments] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null, concept: '' });
  const [formErrors, setFormErrors] = useState({});
  const [formAlert, setFormAlert] = useState('');
  const fetchInProgress = useRef(false);
  const [formData, setFormData] = useState({
    userId: '',
    apartmentId: '',
    amount: '',
    concept: 'Pago de administración',
    dueDate: '',
    paidDate: '',
  });

  useEffect(() => {
    fetchPayments();
    fetchUsers();
    fetchApartments();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await getUsers();
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
    }
  };

  const fetchApartments = async () => {
    try {
      const data = await getApartments();
      setApartments(data || []);
    } catch (error) {
      console.error('Error fetching apartments:', error);
      setApartments([]);
    }
  };

  const fetchPayments = async () => {
    // Prevenir múltiples llamadas concurrentes
    if (fetchInProgress.current) return;
    fetchInProgress.current = true;
    
    try {
      setLoading(true);
      setError(null);
      const data = await getPayments();
      setPayments(data || []);
    } catch (error) {
      console.error('Error fetching payments:', error);
      setError(error.userMessage || 'Error al cargar pagos');
      setPayments([]);
    } finally {
      setLoading(false);
      fetchInProgress.current = false;
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.userId) {
      errors.userId = 'El usuario es requerido';
    }
    
    if (!formData.apartmentId) {
      errors.apartmentId = 'El apartamento es requerido';
    }
    
    if (!formData.amount || formData.amount === '') {
      errors.amount = 'El monto es requerido';
    } else {
      const amountNum = parseFloat(formData.amount);
      if (isNaN(amountNum) || amountNum <= 0) {
        errors.amount = 'El monto debe ser un número mayor a 0';
      } else if (amountNum > 999999999) {
        errors.amount = 'El monto no puede exceder 999,999,999';
      }
    }
    
    if (formData.concept && formData.concept.length > 200) {
      errors.concept = 'El concepto no puede exceder 200 caracteres';
    }
    
    if (!formData.dueDate) {
      errors.dueDate = 'La fecha de vencimiento es requerida';
    }
    
    if (formData.paidDate && formData.dueDate) {
      const paid = new Date(formData.paidDate);
      const due = new Date(formData.dueDate);
      if (paid < due && paid < new Date(due.getTime() - 365 * 24 * 60 * 60 * 1000)) {
        errors.paidDate = 'La fecha de pago no puede ser más de un año antes de la fecha de vencimiento';
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
        await updatePayment(editing.id, formData);
        setSuccess('Pago actualizado exitosamente');
      } else {
        await createPayment(formData);
        setSuccess('Pago registrado exitosamente');
      }
      setOpen(false);
      setEditing(null);
      setFormData({ userId: '', apartmentId: '', amount: '', concept: 'Pago de administración', dueDate: '', paidDate: '' });
      setFormErrors({});
      setFormAlert('');
      fetchPayments();
    } catch (error) {
      console.error('Error creating/updating payment:', error);
      setError(error.userMessage || 'Error al crear/actualizar pago');
    }
  };

  const handleEdit = (payment) => {
    setEditing(payment);
    setFormData({
      userId: payment.userId || '',
      apartmentId: payment.apartment?.id || '',
      amount: payment.amount || '',
      concept: payment.concept || 'Pago de administración',
      dueDate: payment.dueDate ? payment.dueDate.split('T')[0] : '',
      paidDate: payment.paidDate ? payment.paidDate.split('T')[0] : '',
    });
    setFormErrors({});
    setFormAlert('');
    setOpen(true);
  };

  const handleDeleteClick = (id, concept) => {
    setDeleteDialog({ open: true, id, concept: concept || 'este pago' });
  };

  const handleDeleteConfirm = async () => {
    try {
      await deletePayment(deleteDialog.id);
      setSuccess('Pago eliminado exitosamente');
      setDeleteDialog({ open: false, id: null, concept: '' });
      fetchPayments();
    } catch (error) {
      console.error('Error deleting payment:', error);
      setError(error.userMessage || 'Error al eliminar pago');
      setDeleteDialog({ open: false, id: null, concept: '' });
    }
  };

  const handleStatusToggle = async (id, currentStatus) => {
    if (currentStatus === 'paid') return; // No permitir cambiar de pagado

    try {
      await registerPaymentAsPaid(id);
      setSuccess('Pago marcado como realizado exitosamente');
      fetchPayments();
    } catch (error) {
      console.error('Error updating payment status:', error);
      setError(error.userMessage || 'Error al actualizar estado del pago');
    }
  };

  const filteredPayments = payments.filter((payment) => {
    const matchesSearch = payment.concept?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.apartment?.number?.toString().includes(searchTerm) ||
                         payment.apartment?.tower?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'success';
      case 'pending': return 'warning';
      case 'overdue': return 'error';
      default: return 'default';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'paid': return 'Pagado';
      case 'pending': return 'Pendiente';
      case 'overdue': return 'Mora';
      default: return status;
    }
  };

  const columns = [
    {
      field: 'apartment',
      headerName: 'Apartamento',
      width: 120,
      renderCell: (params) => {
        return params.row.apartment ? `Torre ${params.row.apartment.tower} - Apt ${params.row.apartment.number}` : 'N/A';
      },
    },
    {
      field: 'user',
      headerName: 'Usuario',
      width: 150,
      renderCell: (params) => {
        return params.row.user ? `${params.row.user.name}` : 'N/A';
      },
    },
    {
      field: 'concept',
      headerName: 'Concepto',
      width: 200,
    },
    {
      field: 'amount',
      headerName: 'Monto',
      width: 120,
      renderCell: (params) => `$${params.value?.toLocaleString() || 0}`,
    },
    {
      field: 'dueDate',
      headerName: 'Fecha de Vencimiento',
      width: 150,
      renderCell: (params) => {
        if (!params.value) return 'N/A';
        const date = new Date(params.value);
        return date.toLocaleDateString('es-CO');
      },
    },
    {
      field: 'paidDate',
      headerName: 'Fecha de Pago',
      width: 150,
      renderCell: (params) => {
        if (!params.value) return 'N/A';
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
        <Box sx={{ display: 'flex', gap: 1 }}>
          {params.row.status !== 'paid' && (
            <IconButton
              color="success"
              onClick={() => handleStatusToggle(params.row.id, params.row.status)}
              title="Marcar como pagado"
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
            onClick={() => handleDeleteClick(params.row.id, params.row.concept)}
            title="Eliminar"
          >
            <Delete />
          </IconButton>
        </Box>
      ),
    }] : []),
  ];

  if (loading) {
    return <Loading message="Cargando pagos..." />;
  }

  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, letterSpacing: '0.03em' }}>
          Pagos de administración
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Gestión de pagos y cuotas del conjunto residencial
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
              onClick={fetchPayments}
              sx={{
                fontWeight: 600,
                borderRadius: '12px',
                textTransform: 'none',
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

      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
          <TextField
            placeholder="Buscar por concepto, usuario o apartamento"
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
          {user?.role === 'admin' && (
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => {
                setEditing(null);
                setFormData({ userId: '', apartmentId: '', amount: '', concept: 'Pago de administración', dueDate: '', paidDate: '' });
                setFormErrors({});
                setFormAlert('');
                setOpen(true);
              }}
            >
              Agregar pago
            </Button>
          )}
        </Box>

        <Box sx={{ height: 600 }}>
          <DataGrid
            rows={filteredPayments}
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
      <DialogTitle sx={{ textAlign: 'center', color: '#004272', fontWeight: 600, letterSpacing: '0.03em' }}>
        {editing ? 'Editar Pago' : 'Registrar pago de administración'}
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
              label="Selecciona usuario"
              value={formData.userId}
              onChange={(e) => {
                setFormData({ ...formData, userId: e.target.value });
                if (formErrors.userId) setFormErrors({ ...formErrors, userId: '' });
              }}
              fullWidth
              required
              error={!!formErrors.userId}
              helperText={formErrors.userId}
            >
              {users.map((user) => (
                <MenuItem key={user.id} value={user.id}>
                  {`${user.name}`}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Selecciona apartamento"
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
              label="Monto"
              type="number"
              value={formData.amount}
              onChange={(e) => {
                const value = e.target.value;
                setFormData({ ...formData, amount: value });
                if (formErrors.amount) setFormErrors({ ...formErrors, amount: '' });
              }}
              fullWidth
              required
              error={!!formErrors.amount}
              helperText={formErrors.amount || 'Monto mayor a 0'}
              inputProps={{ min: 0.01, max: 999999999, step: 0.01 }}
            />
            <TextField
              label="Concepto"
              value={formData.concept}
              onChange={(e) => {
                const value = e.target.value.slice(0, 200);
                setFormData({ ...formData, concept: value });
                if (formErrors.concept) setFormErrors({ ...formErrors, concept: '' });
              }}
              fullWidth
              error={!!formErrors.concept}
              helperText={formErrors.concept || 'Opcional - Máximo 200 caracteres'}
              inputProps={{ maxLength: 200 }}
            />
            <TextField
              label="Fecha de vencimiento"
              type="date"
              value={formData.dueDate}
              onChange={(e) => {
                setFormData({ ...formData, dueDate: e.target.value });
                if (formErrors.dueDate) setFormErrors({ ...formErrors, dueDate: '' });
              }}
              InputLabelProps={{ shrink: true }}
              fullWidth
              required
              error={!!formErrors.dueDate}
              helperText={formErrors.dueDate}
            />
            <TextField
              label="Fecha de pago"
              type="date"
              value={formData.paidDate}
              onChange={(e) => {
                setFormData({ ...formData, paidDate: e.target.value });
                if (formErrors.paidDate) setFormErrors({ ...formErrors, paidDate: '' });
              }}
              InputLabelProps={{ shrink: true }}
              fullWidth
              error={!!formErrors.paidDate}
              helperText={formErrors.paidDate || 'Opcional'}
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
          sx={{ borderRadius: '12px', textTransform: 'none' }}
        >
          Cancelar
        </Button>
        <Button
          onClick={handleCreate}
          variant="contained"
          sx={{ borderRadius: '12px', textTransform: 'none' }}
        >
          {editing ? 'Actualizar' : 'Registrar'}
        </Button>
      </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, id: null, concept: '' })}
        onConfirm={handleDeleteConfirm}
        title="Eliminar Pago"
        message={`¿Estás seguro de que quieres eliminar el pago "${deleteDialog.concept}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
      />

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
    </Container>
  );
};

export default Payments;
