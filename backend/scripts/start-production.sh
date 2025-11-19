#!/bin/bash

# Variables de entorno
export NODE_ENV=production

# Verificar directorio de logs
mkdir -p logs

# Verificar directorio de datos
mkdir -p data
mkdir -p data-backup

# Iniciar PM2 con el archivo de configuración
pm2 start ecosystem.config.js

# Guardar la configuración de PM2
pm2 save

# Configurar PM2 para iniciar con el sistema
pm2 startup

echo "Servidor iniciado en modo producción"