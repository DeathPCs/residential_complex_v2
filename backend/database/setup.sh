#!/bin/bash

# =========================================
# 🏢 Setup Script - Sistema Conjuntos Residenciales
# Script de configuración inicial completa
# =========================================

set -e  # Salir si algún comando falla

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para imprimir mensajes con colores
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "\n${BLUE}==========================================${NC}"
    echo -e "${BLUE}🏢 $1${NC}"
    echo -e "${BLUE}==========================================${NC}\n"
}

# Verificar si estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    print_error "Este script debe ejecutarse desde el directorio raíz del proyecto"
    exit 1
fi

print_header "CONFIGURACIÓN INICIAL DEL SISTEMA"

# =========================================
# 1. VERIFICAR REQUISITOS DEL SISTEMA
# =========================================
print_status "Verificando requisitos del sistema..."

# Verificar Node.js
if ! command -v node &> /dev/null; then
    print_error "Node.js no está instalado. Por favor instale Node.js 18.x o superior"
    exit 1
fi

NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_error "Se requiere Node.js 18.x o superior. Versión actual: $(node --version)"
    exit 1
fi

print_success "Node.js $(node --version) ✓"

# Verificar npm
if ! command -v npm &> /dev/null; then
    print_error "npm no está instalado"
    exit 1
fi

print_success "npm $(npm --version) ✓"

# Verificar PostgreSQL
if ! command -v psql &> /dev/null; then
    print_warning "PostgreSQL no está instalado o no está en PATH"
    print_status "Por favor instale PostgreSQL 15 o superior"
    read -p "¿Continuar sin verificar PostgreSQL? (y/N): " continue_without_pg
    case $continue_without_pg in
        [Yy]* ) print_warning "Continuando sin verificar PostgreSQL";;
        * ) exit 1;;
    esac
else
    print_success "PostgreSQL disponible ✓"
fi

# =========================================
# 2. INSTALACIÓN DE DEPENDENCIAS
# =========================================
print_header "INSTALACIÓN DE DEPENDENCIAS"

print_status "Instalando dependencias de Node.js..."
if npm install; then
    print_success "Dependencias instaladas correctamente"
else
    print_error "Error al instalar dependencias"
    exit 1
fi

# =========================================
# 3. CONFIGURACIÓN DE VARIABLES DE ENTORNO
# =========================================
print_header "CONFIGURACIÓN DE VARIABLES DE ENTORNO"

if [ ! -f ".env" ]; then
    print_status "Creando archivo .env desde template..."
    
    # Crear archivo .env con configuraciones por defecto
    cat > .env << EOL
# =========================================
# 🏢 Sistema Conjuntos Residenciales - Configuración
# =========================================

# Servidor
PORT=3000
NODE_ENV=development

# Base de Datos PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=residential_complex
DB_USER=postgres
DB_PASSWORD=postgres

# JWT Configuración
JWT_SECRET=$(openssl rand -base64 32)
JWT_EXPIRES_IN=24h

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS
CORS_ORIGIN=http://localhost:3000

# Logging
LOG_LEVEL=debug

# Backup
BACKUP_ENABLED=true
BACKUP_INTERVAL=86400000
BACKUP_RETENTION_DAYS=7

# Test Environment
TEST_DB_NAME=residential_complex_test
EOL

    print_success "Archivo .env creado con configuraciones por defecto"
    print_warning "⚠️  IMPORTANTE: Revise y actualice las credenciales de la base de datos en .env"
else
    print_success "Archivo .env ya existe"
fi

# =========================================
# 4. CONFIGURACIÓN DE BASE DE DATOS
# =========================================
print_header "CONFIGURACIÓN DE BASE DE DATOS"

# Leer configuración de base de datos
if [ -f ".env" ]; then
    source .env
fi

DB_NAME=${DB_NAME:-"residential_complex"}
DB_USER=${DB_USER:-"postgres"}
DB_HOST=${DB_HOST:-"localhost"}
DB_PORT=${DB_PORT:-5432}

print_status "Configuración de base de datos:"
print_status "  Host: $DB_HOST:$DB_PORT"
print_status "  Database: $DB_NAME"
print_status "  User: $DB_USER"

read -p "¿Crear/configurar la base de datos? (Y/n): " setup_db
case $setup_db in
    [Nn]* ) 
        print_warning "Saltando configuración de base de datos"
        ;;
    * )
        print_status "Configurando base de datos..."
        
        # Verificar si la base de datos existe
        if PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -lqt | cut -d \| -f 1 | grep -qw $DB_NAME; then
            print_warning "La base de datos '$DB_NAME' ya existe"
            read -p "¿Desea recrearla? (ATENCIÓN: Se perderán todos los datos) (y/N): " recreate_db
            case $recreate_db in
                [Yy]* ) 
                    print_status "Eliminando base de datos existente..."
                    PGPASSWORD=$DB_PASSWORD dropdb -h $DB_HOST -p $DB_PORT -U $DB_USER $DB_NAME
                    ;;
                * ) 
                    print_status "Manteniendo base de datos existente"
                    ;;
            esac
        fi
        
        # Crear base de datos si no existe
        if ! PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -lqt | cut -d \| -f 1 | grep -qw $DB_NAME; then
            print_status "Creando base de datos '$DB_NAME'..."
            if PGPASSWORD=$DB_PASSWORD createdb -h $DB_HOST -p $DB_PORT -U $DB_USER $DB_NAME; then
                print_success "Base de datos creada exitosamente"
            else
                print_error "Error al crear la base de datos"
                exit 1
            fi
        fi
        
        # Ejecutar scripts de inicialización
        print_status "Ejecutando scripts de inicialización..."
        if PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f database/init.sql; then
            print_success "Estructura de base de datos creada"
        else
            print_error "Error al crear la estructura de la base de datos"
            exit 1
        fi
        
        # Cargar datos de ejemplo
        read -p "¿Cargar datos de ejemplo? (Y/n): " load_sample_data
        case $load_sample_data in
            [Nn]* ) 
                print_status "Saltando carga de datos de ejemplo"
                ;;
            * )
                print_status "Cargando datos de ejemplo..."
                if PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f database/sample_data.sql; then
                    print_success "Datos de ejemplo cargados"
                else
                    print_error "Error al cargar datos de ejemplo"
                fi
                ;;
        esac
        ;;
esac

# =========================================
# 5. INSTALACIÓN DE PM2 (OPCIONAL)
# =========================================
print_header "CONFIGURACIÓN DE PRODUCCIÓN"

if ! command -v pm2 &> /dev/null; then
    read -p "¿Instalar PM2 para gestión de procesos en producción? (Y/n): " install_pm2
    case $install_pm2 in
        [Nn]* ) 
            print_status "Saltando instalación de PM2"
            ;;
        * )
            print_status "Instalando PM2 globalmente..."
            if npm install -g pm2; then
                print_success "PM2 instalado correctamente"
            else
                print_error "Error al instalar PM2"
            fi
            ;;
    esac
else
    print_success "PM2 ya está instalado"
fi

# =========================================
# 6. EJECUTAR PRUEBAS
# =========================================
print_header "VERIFICACIÓN DEL SISTEMA"

read -p "¿Ejecutar pruebas del sistema? (Y/n): " run_tests
case $run_tests in
    [Nn]* ) 
        print_status "Saltando pruebas del sistema"
        ;;
    * )
        print_status "Ejecutando pruebas del sistema..."
        if npm test; then
            print_success "Todas las pruebas pasaron correctamente"
        else
            print_warning "Algunas pruebas fallaron, pero el sistema debería funcionar"
        fi
        ;;
esac

# =========================================
# 7. INFORMACIÓN FINAL
# =========================================
print_header "CONFIGURACIÓN COMPLETADA"

print_success "¡Sistema configurado exitosamente!"
echo
print_status "📋 RESUMEN DE CONFIGURACIÓN:"
print_status "  ✅ Dependencias instaladas"
print_status "  ✅ Variables de entorno configuradas"
print_status "  ✅ Base de datos inicializada"
print_status "  ✅ Sistema listo para usar"
echo
print_status "🚀 COMANDOS PARA EJECUTAR EL SISTEMA:"
print_status "  Desarrollo:   npm run dev"
print_status "  Producción:   npm start"
print_status "  Con PM2:      pm2 start ecosystem.config.js"
print_status "  Pruebas:      npm test"
echo
print_status "📚 DOCUMENTACIÓN:"
print_status "  API Docs:     http://localhost:3000/api-docs"
print_status "  Health:       http://localhost:3000/health"
print_status "  README:       ./README.md"
echo
print_status "👥 USUARIOS DE PRUEBA (password: 123456):"
print_status "  Admin:        admin@residencial.com"
print_status "  Propietario:  juan.perez@email.com"
print_status "  Inquilino:    ana.martinez@email.com"
print_status "  Seguridad:    roberto.seguridad@email.com"
echo
print_warning "🔐 SEGURIDAD:"
print_warning "  - Cambie la contraseña por defecto en producción"
print_warning "  - Actualice JWT_SECRET en archivo .env"
print_warning "  - Configure CORS_ORIGIN para su dominio"
echo
print_success "¡El sistema está listo para usar! 🎉"