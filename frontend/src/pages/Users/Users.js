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
  Person,
  People,
  Home,
  Refresh,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import { getUsers, createUser, updateUser, deleteUser } from '../../services/api';
import Loading from '../../components/common/Loading';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { AuthContext } from '../../context/AuthContext';

const RESIDENT_TYPES = [
  { key: "all", label: "Todos" },
  { key: "owner", label: "Dueño" },
  { key: "tenant", label: "Arrendatario" },
  { key: "airbnb_guest", label: "Airbnb" },
];

const Users = () => {
  const { user } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null, name: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [formAlert, setFormAlert] = useState('');
  const fetchInProgress = useRef(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    cedula: '',
    phone: '',
    password: '',
    role: '',
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    // Prevenir múltiples llamadas concurrentes
    if (fetchInProgress.current) return;
    fetchInProgress.current = true;
    
    try {
      setLoading(true);
      setError(null);
      const response = await getUsers();
      setUsers(response || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError(error.userMessage || 'Error al cargar usuarios');
      setUsers([]);
    } finally {
      setLoading(false);
      fetchInProgress.current = false;
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = 'El nombre es requerido';
    } else if (formData.name.trim().length < 2) {
      errors.name = 'El nombre debe tener al menos 2 caracteres';
    } else if (formData.name.trim().length > 100) {
      errors.name = 'El nombre no puede exceder 100 caracteres';
    }
    
    if (!formData.email.trim()) {
      errors.email = 'El email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'El email no es válido';
    } else if (formData.email.length > 255) {
      errors.email = 'El email no puede exceder 255 caracteres';
    }
    
    if (!formData.cedula.trim()) {
      errors.cedula = 'La cédula es requerida';
    } else if (!/^\d{7,10}$/.test(formData.cedula.trim())) {
      errors.cedula = 'La cédula debe tener entre 7 y 10 dígitos';
    }
    
    if (formData.phone && formData.phone.trim() && !/^\d{7,15}$/.test(formData.phone.trim())) {
      errors.phone = 'El teléfono debe tener entre 7 y 15 dígitos';
    }
    
    if (!editing && !formData.password.trim()) {
      errors.password = 'La contraseña es requerida';
    } else if (!editing && formData.password.trim()) {
      const password = formData.password;
      const passwordErrors = [];
      
      if (password.length < 8) {
        passwordErrors.push('mínimo 8 caracteres');
      } else if (password.length > 50) {
        passwordErrors.push('máximo 50 caracteres');
      }
      
      if (!/[A-Z]/.test(password)) {
        passwordErrors.push('una letra mayúscula');
      }
      
      if (!/[a-z]/.test(password)) {
        passwordErrors.push('una letra minúscula');
      }
      
      if (!/[0-9]/.test(password)) {
        passwordErrors.push('un número');
      }
      
      if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
        passwordErrors.push('un carácter especial (!@#$%^&*...)');
      }
      
      if (passwordErrors.length > 0) {
        errors.password = `La contraseña debe contener: ${passwordErrors.join(', ')}`;
      }
    }
    
    if (!formData.role) {
      errors.role = 'El rol es requerido';
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
        await updateUser(editing.id, formData);
        setSuccess('Usuario actualizado exitosamente');
      } else {
        await createUser(formData);
        setSuccess('Usuario creado exitosamente');
      }
      setOpen(false);
      setEditing(null);
      setFormData({ name: '', email: '', cedula: '', phone: '', password: '', role: '' });
      setFormErrors({});
      setFormAlert('');
      setShowPassword(false);
      fetchUsers();
    } catch (error) {
      console.error('Error creating/updating user:', error);
      setError(error.userMessage || 'Error al crear/actualizar usuario');
    }
  };

  const handleEdit = (user) => {
    setEditing(user);
    setFormData({
      name: user.name,
      email: user.email,
      cedula: user.cedula,
      phone: user.phone || '',
      password: '', // No mostrar contraseña existente
      role: user.role,
    });
    setFormErrors({});
    setFormAlert('');
    setShowPassword(false);
    setOpen(true);
  };

  const handleDeleteClick = (id, name) => {
    setDeleteDialog({ open: true, id, name });
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteUser(deleteDialog.id);
      setSuccess('Usuario eliminado exitosamente');
      setDeleteDialog({ open: false, id: null, name: '' });
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      setError(error.userMessage || 'Error al eliminar usuario');
      setDeleteDialog({ open: false, id: null, name: '' });
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesRole = filter === "all" || user.role === filter;
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.trim().toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.trim().toLowerCase()) ||
                         user.cedula.toLowerCase().includes(searchTerm.trim().toLowerCase());
    return matchesRole && matchesSearch;
  });

  const getRoleIcon = (role) => {
    switch (role) {
      case 'owner': return <Person />;
      case 'tenant': return <People />;
      case 'airbnb_guest': return <Home />;
      default: return <Person />;
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'owner': return 'info';
      case 'tenant': return 'warning';
      case 'airbnb_guest': return 'error';
      case 'admin': return 'success';
      default: return 'default';
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'owner': return 'Dueño';
      case 'tenant': return 'Arrendatario';
      case 'airbnb_guest': return 'Airbnb';
      case 'admin': return 'Administrador'
      default: return role;
    }
  };

  const columns = [
    {
      field: 'name',
      headerName: 'Nombre',
      width: 200,
    },
    {
      field: 'email',
      headerName: 'Email',
      width: 250,
    },
    {
      field: 'cedula',
      headerName: 'Cédula',
      width: 150,
    },
    {
      field: 'phone',
      headerName: 'Teléfono',
      width: 150,
    },
    {
      field: 'role',
      headerName: 'Rol',
      width: 150,
      renderCell: (params) => (
        <Chip
          icon={getRoleIcon(params.value)}
          label={getRoleLabel(params.value)}
          color={getRoleColor(params.value)}
          size="small"
        />
      ),
    },
    ...(user?.role === 'admin' ? [{
      field: 'actions',
      headerName: 'Acciones',
      width: 150,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton
            color="primary"
            onClick={() => handleEdit(params.row)}
            title="Editar"
          >
            <Edit />
          </IconButton>
          <IconButton
            color="error"
            onClick={() => handleDeleteClick(params.row.id, params.row.name)}
            title="Eliminar"
          >
            <Delete />
          </IconButton>
        </Box>
      ),
    }] : []),
  ];

  if (loading) {
    return <Loading message="Cargando residentes..." />;
  }

  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, letterSpacing: '0.03em' }}>
          Residentes del conjunto
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Gestión de usuarios del conjunto residencial
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
              onClick={fetchUsers}
            >
              Reintentar
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {RESIDENT_TYPES.map((type) => (
              <Button
                key={type.key}
                variant={filter === type.key ? 'contained' : 'outlined'}
                onClick={() => setFilter(type.key)}
                sx={{
                  borderRadius: '14px',
                  textTransform: 'none',
                  backgroundColor: filter === type.key ? '#25b884' : '#e8ecf2',
                  color: filter === type.key ? '#fff' : '#444',
                  borderColor: filter === type.key ? '#25b884' : '#e8ecf2',
                  '&:hover': {
                    backgroundColor: filter === type.key ? '#1f9a6c' : '#d0d7de',
                    borderColor: filter === type.key ? '#1f9a6c' : '#d0d7de',
                  },
                }}
              >
                {type.label}
              </Button>
            ))}
          </Box>
          <TextField
            placeholder="Buscar por nombre, email o cédula..."
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
                setFormData({ name: '', email: '', cedula: '', phone: '', password: '', role: '' });
                setFormErrors({});
                setFormAlert('');
                setShowPassword(false);
                setOpen(true);
              }}
              sx={{
                minHeight:60,
              }}
            >
              Nuevo Usuario
            </Button>
          )}
        </Box>

        <Box sx={{ height: 600 }}>
          <DataGrid
            rows={filteredUsers}
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
      >
        <DialogTitle sx={{ textAlign: 'center', color: '#004272' }}>
          {editing ? 'Editar Usuario' : 'Nuevo Usuario'}
        </DialogTitle>
        <DialogContent>
          {formAlert && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              {formAlert}
            </Alert>
          )}
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Nombre"
              value={formData.name}
              onChange={(e) => {
                const value = e.target.value.slice(0, 100);
                setFormData({ ...formData, name: value });
                if (formErrors.name) setFormErrors({ ...formErrors, name: '' });
              }}
              fullWidth
              required
              error={!!formErrors.name}
              helperText={formErrors.name}
              inputProps={{ maxLength: 100 }}
            />
            <TextField
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => {
                const value = e.target.value.slice(0, 255);
                setFormData({ ...formData, email: value });
                if (formErrors.email) setFormErrors({ ...formErrors, email: '' });
              }}
              fullWidth
              required
              error={!!formErrors.email}
              helperText={formErrors.email}
              inputProps={{ maxLength: 255 }}
            />
            <TextField
              label="Cédula"
              value={formData.cedula}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                setFormData({ ...formData, cedula: value });
                if (formErrors.cedula) setFormErrors({ ...formErrors, cedula: '' });
              }}
              fullWidth
              required
              error={!!formErrors.cedula}
              helperText={formErrors.cedula || 'Entre 7 y 10 dígitos'}
              inputProps={{ maxLength: 10 }}
            />
            <TextField
              label="Teléfono"
              value={formData.phone}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 15);
                setFormData({ ...formData, phone: value });
                if (formErrors.phone) setFormErrors({ ...formErrors, phone: '' });
              }}
              fullWidth
              error={!!formErrors.phone}
              helperText={formErrors.phone || 'Opcional - Entre 7 y 15 dígitos'}
              inputProps={{ maxLength: 15 }}
            />
            {!editing && (
              <TextField
                label="Contraseña"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => {
                  const value = e.target.value.slice(0, 50);
                  setFormData({ ...formData, password: value });
                  if (formErrors.password) setFormErrors({ ...formErrors, password: '' });
                }}
                fullWidth
                required
                error={!!formErrors.password}
                helperText={formErrors.password || 'Mínimo 8 caracteres, incluir mayúscula, minúscula, número y carácter especial'}
                inputProps={{ maxLength: 50 }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            )}
            <TextField
              select
              label="Rol"
              value={formData.role}
              onChange={(e) => {
                setFormData({ ...formData, role: e.target.value });
                if (formErrors.role) setFormErrors({ ...formErrors, role: '' });
              }}
              fullWidth
              required
              error={!!formErrors.role}
              helperText={formErrors.role}
            >
              <MenuItem value="owner">Propietario</MenuItem>
              <MenuItem value="tenant">Arrendatario</MenuItem>
              <MenuItem value="airbnb_guest">Huésped Airbnb</MenuItem>
              {/* <MenuItem value="security">Vigilante</MenuItem> */}
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
        onClose={() => setDeleteDialog({ open: false, id: null, name: '' })}
        onConfirm={handleDeleteConfirm}
        title="Eliminar Usuario"
        message={`¿Estás seguro de que quieres eliminar al usuario "${deleteDialog.name}"? Esta acción no se puede deshacer.`}
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

export default Users;
