import React, { useState } from 'react';
import {
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  List,
  ListItem,
  ListItemText,
  Box,
  Avatar,
  Paper,
} from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import CloseIcon from '@mui/icons-material/Close';

const faqData = [
  {
    question: '¿Qué es este aplicativo?',
    answer: 'Este es un sistema de gestión para complejos residenciales que permite administrar usuarios, apartamentos, pagos, mantenimiento, reportes de daños y reservas Airbnb.',
  },
  {
    question: '¿Cómo registrar un nuevo usuario?',
    answer: 'Para registrar un nuevo usuario, ve a la sección "Usuarios" en el menú lateral, haz clic en "Agregar Usuario" y completa el formulario con la información requerida.',
  },
  {
    question: '¿Cómo reportar un daño en un apartamento?',
    answer: 'En la sección "Reportes de Daños", selecciona "Nuevo Reporte", elige el apartamento afectado, describe el daño y adjunta fotos si es posible.',
  },
  {
    question: '¿Cómo ver los pagos pendientes?',
    answer: 'Accede a la sección "Pagos" desde el menú lateral. Allí podrás ver todos los pagos, filtrarlos por estado y gestionar los pendientes.',
  },
  {
    question: '¿Cómo gestionar el mantenimiento?',
    answer: 'En la sección "Mantenimiento", puedes crear nuevas solicitudes, asignar técnicos y actualizar el estado de las reparaciones.',
  },
  {
    question: '¿Cómo configurar reservas Airbnb?',
    answer: 'Ve a la sección "Airbnb" para gestionar las reservas de huéspedes temporales, incluyendo check-in y check-out.',
  },
];

const Chatbot = () => {
  const [open, setOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setSelectedQuestion(null);
  };

  const handleQuestionClick = (index) => {
    setSelectedQuestion(index);
  };

  const handleBack = () => {
    setSelectedQuestion(null);
  };

  return (
    <>
      <Fab
        color="primary"
        aria-label="chat"
        onClick={handleOpen}
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          zIndex: 1000,
        }}
      >
        <ChatIcon />
      </Fab>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '16px',
            maxHeight: '80vh',
          },
        }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
              <ChatIcon />
            </Avatar>
            <Typography variant="h6">Asistente de Ayuda</Typography>
          </Box>
          <Button onClick={handleClose} sx={{ minWidth: 'auto', p: 1 }}>
            <CloseIcon />
          </Button>
        </DialogTitle>
        <DialogContent dividers>
          {selectedQuestion === null ? (
            <>
              <Typography variant="body1" gutterBottom>
                ¡Hola! Soy el asistente virtual. Selecciona una pregunta frecuente para obtener más información:
              </Typography>
              <List>
                {faqData.map((item, index) => (
                  <ListItem
                    key={index}
                    button
                    onClick={() => handleQuestionClick(index)}
                    sx={{
                      borderRadius: '8px',
                      mb: 1,
                      '&:hover': {
                        backgroundColor: 'action.hover',
                      },
                    }}
                  >
                    <ListItemText primary={item.question} />
                  </ListItem>
                ))}
              </List>
            </>
          ) : (
            <Paper elevation={0} sx={{ p: 2, backgroundColor: 'background.paper' }}>
              <Typography variant="h6" gutterBottom>
                {faqData[selectedQuestion].question}
              </Typography>
              <Typography variant="body1">
                {faqData[selectedQuestion].answer}
              </Typography>
            </Paper>
          )}
        </DialogContent>
        {selectedQuestion !== null && (
          <DialogActions>
            <Button onClick={handleBack} color="secondary">
              Volver
            </Button>
          </DialogActions>
        )}
      </Dialog>
    </>
  );
};

export default Chatbot;
