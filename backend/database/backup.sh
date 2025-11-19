#!/bin/bash

# =========================================
# 🏢 Database Backup Script
# Script para respaldos automáticos de PostgreSQL
# =========================================

set -e

# Configuración
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
BACKUP_DIR="$SCRIPT_DIR/backups"
LOG_FILE="$PROJECT_ROOT/logs/backup.log"

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Función de logging
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
    log "INFO: $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
    log "SUCCESS: $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
    log "ERROR: $1"
}

# Cargar variables de entorno
if [ -f "$PROJECT_ROOT/.env" ]; then
    source "$PROJECT_ROOT/.env"
else
    print_error "Archivo .env no encontrado en $PROJECT_ROOT"
    exit 1
fi

# Configuración de base de datos
DB_NAME=${DB_NAME:-"residential_complex"}
DB_USER=${DB_USER:-"postgres"}
DB_HOST=${DB_HOST:-"localhost"}
DB_PORT=${DB_PORT:-5432}
DB_PASSWORD=${DB_PASSWORD}

# Verificar configuración
if [ -z "$DB_PASSWORD" ]; then
    print_error "DB_PASSWORD no está configurado en .env"
    exit 1
fi

# Crear directorio de backups si no existe
mkdir -p "$BACKUP_DIR"

# Generar nombre de archivo con timestamp
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/residential_complex_$TIMESTAMP.sql"
BACKUP_COMPRESSED="$BACKUP_FILE.gz"

print_status "Iniciando respaldo de base de datos..."
print_status "Database: $DB_NAME"
print_status "Host: $DB_HOST:$DB_PORT"
print_status "User: $DB_USER"
print_status "Backup file: $BACKUP_FILE"

# Ejecutar respaldo
print_status "Creando respaldo..."
if PGPASSWORD="$DB_PASSWORD" pg_dump \
    -h "$DB_HOST" \
    -p "$DB_PORT" \
    -U "$DB_USER" \
    --verbose \
    --clean \
    --no-owner \
    --no-privileges \
    "$DB_NAME" > "$BACKUP_FILE" 2>>"$LOG_FILE"; then
    
    print_success "Respaldo creado exitosamente"
    
    # Comprimir respaldo
    print_status "Comprimiendo respaldo..."
    if gzip "$BACKUP_FILE"; then
        print_success "Respaldo comprimido: $(basename "$BACKUP_COMPRESSED")"
        FINAL_BACKUP="$BACKUP_COMPRESSED"
    else
        print_error "Error al comprimir respaldo"
        FINAL_BACKUP="$BACKUP_FILE"
    fi
    
    # Mostrar información del respaldo
    BACKUP_SIZE=$(du -h "$FINAL_BACKUP" | cut -f1)
    print_success "Tamaño del respaldo: $BACKUP_SIZE"
    
else
    print_error "Error al crear respaldo"
    rm -f "$BACKUP_FILE"
    exit 1
fi

# Limpiar respaldos antiguos (mantener últimos 7 días por defecto)
RETENTION_DAYS=${BACKUP_RETENTION_DAYS:-7}
print_status "Limpiando respaldos antiguos (más de $RETENTION_DAYS días)..."

find "$BACKUP_DIR" -name "residential_complex_*.sql*" -type f -mtime +$RETENTION_DAYS -delete 2>/dev/null || true

REMAINING_BACKUPS=$(find "$BACKUP_DIR" -name "residential_complex_*.sql*" -type f | wc -l)
print_status "Respaldos mantenidos: $REMAINING_BACKUPS"

print_success "Proceso de respaldo completado exitosamente"

# Verificar integridad del respaldo (opcional)
if command -v zcat >/dev/null 2>&1 && [[ "$FINAL_BACKUP" == *.gz ]]; then
    print_status "Verificando integridad del respaldo comprimido..."
    if zcat "$FINAL_BACKUP" | head -n 5 | grep -q "PostgreSQL database dump"; then
        print_success "Respaldo verificado correctamente"
    else
        print_error "El respaldo podría estar corrupto"
        exit 1
    fi
elif [[ "$FINAL_BACKUP" == *.sql ]]; then
    print_status "Verificando integridad del respaldo..."
    if head -n 5 "$FINAL_BACKUP" | grep -q "PostgreSQL database dump"; then
        print_success "Respaldo verificado correctamente"
    else
        print_error "El respaldo podría estar corrupto"
        exit 1
    fi
fi

echo
print_success "✅ Respaldo completado:"
print_status "  📁 Archivo: $(basename "$FINAL_BACKUP")"
print_status "  📊 Tamaño: $BACKUP_SIZE"
print_status "  📅 Fecha: $(date '+%Y-%m-%d %H:%M:%S')"
print_status "  📍 Ruta: $FINAL_BACKUP"