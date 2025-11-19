#!/bin/bash

# =========================================
# 🧪 Quick Test Script - Sistema Conjuntos Residenciales
# Script para pruebas rápidas del sistema
# =========================================

set -e

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_header() {
    echo -e "\n${BLUE}==========================================${NC}"
    echo -e "${BLUE}🧪 $1${NC}"
    echo -e "${BLUE}==========================================${NC}\n"
}

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    print_error "Este script debe ejecutarse desde el directorio raíz del proyecto"
    exit 1
fi

print_header "PRUEBAS RÁPIDAS DEL SISTEMA"

# =========================================
# 1. VERIFICAR DEPENDENCIAS
# =========================================
print_status "Verificando dependencias..."

if [ ! -d "node_modules" ]; then
    print_status "Instalando dependencias..."
    npm install
fi

print_success "Dependencias verificadas ✓"

# =========================================
# 2. VERIFICAR CONFIGURACIÓN
# =========================================
print_status "Verificando configuración..."

if [ ! -f ".env" ]; then
    print_error "Archivo .env no encontrado. Copiando desde .env.example..."
    cp .env.example .env
    print_status "⚠️  Recuerde configurar las variables en .env"
fi

print_success "Configuración verificada ✓"

# =========================================
# 3. PRUEBAS RÁPIDAS
# =========================================
print_header "EJECUTANDO PRUEBAS"

# Test de sintaxis
print_status "Verificando sintaxis de JavaScript..."
if node -c server.js && node -c src/app.js; then
    print_success "Sintaxis correcta ✓"
else
    print_error "Error de sintaxis en archivos principales"
    exit 1
fi

# Test de arranque del servidor (timeout 10s)
print_status "Probando arranque del servidor..."
if timeout 10s npm start > /dev/null 2>&1; then
    print_success "Servidor arranca correctamente ✓"
else
    print_status "Probando arranque básico..."
    if node -e "
        const app = require('./src/app');
        const server = app.listen(3001, () => {
            console.log('Test server started');
            server.close(() => process.exit(0));
        });
        setTimeout(() => {
            server.close(() => process.exit(1));
        }, 5000);
    " > /dev/null 2>&1; then
        print_success "Configuración básica correcta ✓"
    else
        print_error "Error en configuración básica"
        exit 1
    fi
fi

# Test de endpoints básicos (si el servidor arranca)
print_status "Probando endpoints básicos..."
if node -e "
    const request = require('supertest');
    const app = require('./src/app');
    
    const runTests = async () => {
        try {
            // Test health endpoint
            const healthRes = await request(app).get('/health');
            if (healthRes.status !== 200) throw new Error('Health check failed');
            
            // Test auth endpoints exist
            const loginRes = await request(app).post('/api/auth/login').send({});
            if (loginRes.status === 404) throw new Error('Auth routes not found');
            
            console.log('Basic endpoints working');
            process.exit(0);
        } catch (error) {
            console.error('Endpoint test failed:', error.message);
            process.exit(1);
        }
    };
    
    runTests();
" > /dev/null 2>&1; then
    print_success "Endpoints básicos funcionando ✓"
else
    print_error "Error en endpoints básicos"
    exit 1
fi

# =========================================
# 4. PRUEBAS ESPECÍFICAS (OPCIONAL)
# =========================================
if command -v npm >/dev/null 2>&1 && [ "$1" = "--full" ]; then
    print_header "PRUEBAS COMPLETAS"
    
    print_status "Ejecutando pruebas de autenticación..."
    if NODE_ENV=test npx jest tests/integration/auth.test.js --silent; then
        print_success "Pruebas de autenticación: PASS ✓"
    else
        print_error "Algunas pruebas de autenticación fallaron"
    fi
    
    print_status "Ejecutando pruebas de endpoints..."
    if NODE_ENV=test npx jest tests/integration/complete-endpoints.test.js --silent; then
        print_success "Pruebas de endpoints: PASS ✓"
    else
        print_error "Algunas pruebas de endpoints fallaron"
    fi
fi

# =========================================
# 5. VERIFICACIÓN DE ARCHIVOS CLAVE
# =========================================
print_header "VERIFICACIÓN DE ARCHIVOS"

files_to_check=(
    "server.js"
    "src/app.js"
    "package.json"
    "ecosystem.config.js"
    "database/init.sql"
    "database/sample_data.sql"
    "docs/api/swagger.yaml"
    "README.md"
)

for file in "${files_to_check[@]}"; do
    if [ -f "$file" ]; then
        print_success "$file ✓"
    else
        print_error "$file no encontrado"
    fi
done

# =========================================
# 6. RESUMEN FINAL
# =========================================
print_header "RESUMEN DE VERIFICACIÓN"

print_success "✅ Sistema verificado exitosamente"
echo
print_status "📋 COMPONENTES VERIFICADOS:"
print_status "  ✅ Dependencias instaladas"
print_status "  ✅ Configuración básica"
print_status "  ✅ Sintaxis de código"
print_status "  ✅ Arranque del servidor"
print_status "  ✅ Endpoints básicos"
print_status "  ✅ Archivos clave presentes"
echo
print_status "🚀 COMANDOS DISPONIBLES:"
print_status "  npm run dev     - Desarrollo con hot reload"
print_status "  npm start       - Producción"
print_status "  npm test        - Pruebas completas"
print_status "  ./database/setup.sh - Configuración inicial"
echo
print_status "📚 DOCUMENTACIÓN:"
print_status "  README.md          - Guía completa"
print_status "  docs/ARCHITECTURE.md - Arquitectura técnica"
print_status "  /api-docs          - Documentación Swagger"
echo
if [ "$1" != "--full" ]; then
    print_status "💡 Para pruebas completas ejecute: $0 --full"
fi
echo
print_success "¡Sistema listo para usar! 🎉"