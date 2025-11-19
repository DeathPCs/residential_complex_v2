# 📚 Ejemplos de Endpoints de Usuario

### Obtener usuarios (paginación y filtro)
```bash
curl -X GET "http://localhost:3000/api/users?page=1&limit=10&email=admin@residential.com"
```

### Actualizar usuario
```bash
curl -X PUT "http://localhost:3000/api/users/<id>" \
  -H "Content-Type: application/json" \
  -d '{"name":"Nuevo Nombre","status":"active"}'
```

### Eliminar usuario
```bash
curl -X DELETE "http://localhost:3000/api/users/<id>"
```

### Parámetros principales
- `page`: número de página (opcional)
- `limit`: cantidad de resultados por página (opcional, máximo 100)
- `email`: filtra por email (opcional)
- `id`: UUID del usuario

Todos los endpoints requieren autenticación JWT en el header:
`Authorization: Bearer <token>`
# 🏢 Sistema de Gestión de Conjuntos Residenciales# 🏠 Sistema Conjuntos Residenciales - Backend API



Sistema completo de gestión para conjuntos residenciales desarrollado con Node.js, Express.js y PostgreSQL. Incluye autenticación JWT, gestión multi-rol, sistema de notificaciones automáticas y módulos especializados para administración, mantenimiento, Airbnb y más.Sistema completo de gestión para conjuntos residenciales desarrollado en Node.js.



[![Node.js](https://img.shields.io/badge/Node.js-18.x-green.svg)](https://nodejs.org/)## 🚀 Características

[![Express.js](https://img.shields.io/badge/Express.js-4.21.2-blue.svg)](https://expressjs.com/)

[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-blue.svg)](https://postgresql.org/)- **Gestión de Usuarios**: Administradores, propietarios, inquilinos, personal

[![JWT](https://img.shields.io/badge/JWT-Authentication-orange.svg)](https://jwt.io/)- **Administración de Apartamentos**: Estados, contratos, información completa

[![Tests](https://img.shields.io/badge/Tests-25%2F25%20Passing-brightgreen.svg)](https://jestjs.io/)- **Sistema de Pagos**: Cuotas, servicios, multas con seguimiento

- **Mantenimiento**: Solicitudes, asignaciones, costos y seguimiento

## 🚀 Características Principales- **Airbnb Integration**: Gestión de huéspedes temporales

- **Notificaciones**: Sistema completo de alertas y comunicaciones

### 🔐 Sistema de Autenticación- **Reportes de Daños**: Seguimiento y resolución de incidentes

- **JWT Authentication** con tokens seguros- **Sistema de Logs**: Registro detallado de operaciones y errores

- **4 Roles de usuario**: Admin, Owner, Tenant, Security- **Respaldo Automático**: Backup programado de datos críticos

- **Control de permisos granular** por endpoint- **Optimización de Rendimiento**: Compresión, caché y rate limiting

- **Middleware de seguridad** robusto

## 🛠️ Stack Tecnológico

### 🏠 Gestión de Apartamentos

- Registro y gestión de apartamentos  - **Backend**: Node.js + Express.js

- Asociación con propietarios- **Autenticación**: JWT (JSON Web Tokens)

- Estados: ocupado, alquilado, disponible- **Seguridad**: bcrypt, Helmet, CORS, Rate Limiting

- Información detallada por unidad- **Logging**: Winston para logs estructurados

- **Environment**: dotenv para múltiples entornos

### ✈️ Sistema Airbnb Integrado- **Monitoreo**: PM2 para gestión de procesos

- Registro de huéspedes con validación- **Optimización**: Compression, Cache-Control

- **Check-in automático** por portería- **Testing**: Jest para pruebas unitarias e integración

- **Notificaciones automáticas** a propietarios y administración

- Control de huéspedes activos## 📦 Instalación y Configuración

- Gestión de fechas de estadía

### Prerrequisitos

### 🔧 Sistema de Mantenimiento- Node.js 16+

- Programación de mantenimientos- npm o yarn

- **Notificación masiva** a todos los residentes- PM2 (para producción)

- Control de estados: pendiente, en progreso, completado

- Gestión por áreas: piscina, gimnasio, zonas comunes### Desarrollo



### ⚠️ Reportes de Daños```bash

- Reporte de daños por inquilinos# 1. Clonar repositorio

- **Notificación automática** al propietariogit clone https://github.com/loltrolgamer12/residential_complex.git

- Seguimiento de estadoscd residential_complex

- Historial de reportes por usuario

# 2. Instalar dependencias

### 📬 Sistema de Notificacionesnpm install

- **Notificaciones automáticas** del sistema

- Notificaciones manuales por administración# 3. Configurar variables de entorno

- Tipos: Airbnb, mantenimiento, pagos, generalcp .env.example .env

- Estado de lectura y gestión por usuario# Editar .env con tus configuraciones



### 💰 Gestión de Pagos# 4. Ejecutar en desarrollo

- Registro de cuotas de administraciónnpm run dev

- Control de pagos y fechas de vencimiento```

- Estados: pendiente, pagado, vencido

- Historial de pagos por apartamento### Producción



## 🛠️ Stack Tecnológico```bash

# 1. Configurar entorno de producción

```cp .env.example .env.production

Backend:     Node.js 18.x + Express.js 4.21.2# Editar .env.production con configuraciones de producción

Database:    PostgreSQL 15+ con Sequelize ORM 6.37.7

Auth:        JWT (jsonwebtoken 9.0.2) + bcrypt# 2. Instalar PM2 globalmente

Testing:     Jest 29.7.0 + Supertestnpm install -g pm2

Deploy:      PM2 6.0.10 con Ecosystem

Security:    Helmet, CORS, Rate Limiting, Input Validation# 3. Construir para producción

Logging:     Winston 3.17.0npm run build

Docs:        Swagger/OpenAPI 3.0

```# 4. Iniciar con PM2

npm run start:prod

## 📋 Requisitos del Sistema```



- **Node.js** 18.x o superior## 🔧 Configuración

- **PostgreSQL** 15 o superior

- **NPM** 8.x o superior### Variables de Entorno

- **PM2** (para producción)

```env

## ⚡ Instalación Rápida# Configuración del Servidor

PORT=3000

### 1. Clonar el RepositorioNODE_ENV=development # o production

```bashLOG_LEVEL=debug # o info en producción

git clone https://github.com/loltrolgamer12/residential_complex.git

cd residential_complex# JWT y Seguridad

```JWT_SECRET=your-secret-key

JWT_EXPIRES_IN=24h

### 2. Instalar DependenciasBCRYPT_ROUNDS=12

```bashCORS_ORIGIN=http://localhost:3000

npm install

```# Límites y Caché

RATE_LIMIT_WINDOW=900000

### 3. Configurar Base de DatosRATE_LIMIT_MAX=100

```bashCACHE_DURATION=86400000

# Crear base de datos PostgreSQL

createdb residential_complex# Backup

BACKUP_ENABLED=true

# Ejecutar scripts de inicializaciónBACKUP_INTERVAL=86400000

cd databaseBACKUP_RETENTION_DAYS=7

psql -d residential_complex -f init.sql```

psql -d residential_complex -f sample_data.sql

cd ..## 📚 API Endpoints

```

### Health Check

### 4. Configurar Variables de Entorno- `GET /health` - Verificar estado del servidor

```bash

cp .env.example .env### Autenticación

# Editar .env con tus configuraciones- `POST /api/auth/login` - Iniciar sesión

```- `POST /api/auth/register` - Registrar usuario



### 5. Ejecutar el Sistema### Usuarios

```bash- `GET /api/users` - Listar usuarios

# Desarrollo- `GET /api/users/:id` - Obtener usuario específico

npm run dev- `PUT /api/users/:id` - Actualizar usuario

- `DELETE /api/users/:id` - Eliminar usuario

# Producción

npm start### Apartamentos

```- `GET /api/apartments` - Listar apartamentos

- `POST /api/apartments` - Crear apartamento

## 🔧 Configuración Detallada- `PUT /api/apartments/:id` - Actualizar apartamento

- `PUT /api/apartments/:id/status` - Cambiar estado

### Variables de Entorno (.env)

```env### Pagos

# Servidor- `GET /api/payments` - Listar pagos

PORT=3000- `POST /api/payments` - Crear pago

NODE_ENV=development- `PUT /api/payments/:id/paid` - Marcar como pagado



# Base de Datos### Mantenimiento

DB_HOST=localhost- `GET /api/maintenance/requests` - Listar solicitudes

DB_PORT=5432- `POST /api/maintenance/requests` - Crear solicitud

DB_NAME=residential_complex- `PUT /api/maintenance/requests/:id` - Actualizar solicitud

DB_USER=tu_usuario

DB_PASSWORD=tu_password## 🔍 Logs y Monitoreo



# JWTEl sistema incluye logs estructurados usando Winston:

JWT_SECRET=tu_jwt_secret_muy_seguro- Logs de acceso y errores

JWT_EXPIRES_IN=24h- Rotación automática de logs

- Niveles diferentes para desarrollo y producción

# Rate Limiting- Monitoreo de recursos con PM2

RATE_LIMIT_WINDOW_MS=900000

RATE_LIMIT_MAX_REQUESTS=100## 💾 Sistema de Respaldo



# CORSBackup automático de datos críticos:

CORS_ORIGIN=http://localhost:3000- Programación configurable

```- Retención personalizable

- Compresión de backups

### Configuración de Base de Datos- Logs de operaciones de respaldo

```javascript

// config/database.js## ⚡ Optimizaciones

module.exports = {

  development: {- Compresión gzip/deflate

    username: process.env.DB_USER,- Rate limiting por IP

    password: process.env.DB_PASSWORD,- Caché de respuestas

    database: process.env.DB_NAME,- Validación de datos

    host: process.env.DB_HOST,- Headers de seguridad

    port: process.env.DB_PORT,- CORS configurado

    dialect: 'postgres',

    logging: console.log## 🛡️ Seguridad

  },

  production: {- JWT para autenticación

    use_env_variable: 'DATABASE_URL',- Encriptación de contraseñas con bcrypt

    dialect: 'postgres',- Headers de seguridad con Helmet

    logging: false,- Rate limiting contra ataques DoS

    ssl: true,- Validación de datos de entrada

    dialectOptions: {- CORS configurable

      ssl: {

        require: true,## 📜 Scripts

        rejectUnauthorized: false

      }- `npm run dev` - Desarrollo con hot-reload

    }- `npm run build` - Construir para producción

  }- `npm run start:prod` - Iniciar en producción con PM2

};- `npm run backup` - Ejecutar backup manual

```- `npm test` - Ejecutar tests

- `npm run lint` - Verificar código

## 🔐 Sistema de Autenticación

## 👥 Contribución

### Roles de Usuario

1. Fork el repositorio

| Rol | Permisos | Funcionalidades |2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)

|-----|----------|-----------------|3. Commit tus cambios (`git commit -m 'Add: AmazingFeature'`)

| **Admin** | Completos | Todas las funciones del sistema |4. Push a la rama (`git push origin feature/AmazingFeature`)

| **Owner** | Gestión de apartamentos | Airbnb, apartamentos, consultas |5. Abre un Pull Request

| **Tenant** | Básicos | Reportes de daños, consultas |

| **Security** | Control de acceso | Check-in Airbnb, consulta huéspedes |## 📄 Licencia



### Endpoints de AutenticaciónEste proyecto está bajo la Licencia MIT - ver el archivo [LICENSE.md](LICENSE.md) para detalles

- `POST /api/maintenance/requests` - Crear solicitud

#### Registro- `PUT /api/maintenance/requests/:id/status` - Actualizar estado

```http

POST /api/auth/register## 🧪 Testing

Content-Type: application/json

```bash

{# Ejecutar servidor de desarrollo

  "name": "Juan Pérez",npm run dev

  "email": "juan@example.com",

  "password": "Password123!",# Test endpoints básicos

  "cedula": "12345678",curl http://localhost:3000/health

  "phone": "+57 300 123 4567",curl http://localhost:3000/api/test

  "role": "tenant"```

}

```## 📖 Documentación



#### Login### Usuarios de Prueba

```http

POST /api/auth/login```json

Content-Type: application/json{

    "admin": {

{        "email": "admin@complejo.com",

  "email": "juan@example.com",        "password": "123456"

  "password": "Password123!"    },

}    "owner": {

```        "email": "juan.perez@email.com", 

        "password": "123456"

#### Respuesta de Autenticación    }

```json}

{```

  "success": true,

  "message": "Login exitoso",## 🔐 Seguridad

  "data": {

    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",- Autenticación JWT obligatoria

    "user": {- Validación de roles y permisos

      "id": 1,- Sanitización de entrada de datos

      "name": "Juan Pérez",- Rate limiting implementado

      "email": "juan@example.com",- Logs de auditoría completos

      "role": "tenant",

      "isActive": true## 📁 Estructura del Proyecto

    }

  }```

}residential_complex/

```├── config/              # Configuraciones

├── src/

## 📡 API Endpoints│   ├── domain/          # Entidades de negocio

│   ├── application/     # Casos de uso

### 🔑 Autenticación│   ├── infrastructure/  # Capa de infraestructura

- `POST /api/auth/register` - Registrar usuario│   │   ├── web/         # Rutas, controladores, middleware

- `POST /api/auth/login` - Iniciar sesión│   │   └── database/    # Conexiones y repositorios

- `GET /api/auth/profile` - Obtener perfil (requiere token)│   └── shared/          # Utilidades compartidas

├── docs/                # Documentación

### 🏠 Apartamentos├── tests/               # Pruebas

- `GET /api/apartments` - Listar apartamentos└── package.json

- `POST /api/apartments` - Registrar apartamento (Owner/Admin)```

- `GET /api/apartments/:id` - Obtener apartamento específico

## 🤝 Contribución

### ✈️ Sistema Airbnb

- `POST /api/airbnb/guests` - Registrar huésped (Owner/Admin)Este es un proyecto universitario. Para contribuir:

- `GET /api/airbnb/guests/active` - Huéspedes activos (Security/Admin)

- `PUT /api/airbnb/guests/:id/checkin` - Check-in (Security/Admin)1. Fork el proyecto

- `PUT /api/airbnb/guests/:id/checkout` - Check-out (Security/Admin)2. Crear rama feature (`git checkout -b feature/nueva-funcionalidad`)

3. Commit cambios (`git commit -m 'Agregar nueva funcionalidad'`)

### 🔧 Mantenimiento4. Push a la rama (`git push origin feature/nueva-funcionalidad`)

- `GET /api/maintenance` - Listar mantenimientos5. Crear Pull Request

- `POST /api/maintenance` - Crear mantenimiento (Admin)

- `PUT /api/maintenance/:id/status` - Actualizar estado (Admin)## 📄 Licencia



### ⚠️ Reportes de DañosProyecto académico - Universidad Surcolombiana

- `GET /api/damage-reports` - Listar reportes (Admin)

- `POST /api/damage-reports` - Crear reporte (autenticado)## 👨‍💻 Desarrollador

- `GET /api/damage-reports/my-reports` - Mis reportes (autenticado)

- **GitHub**: [@loltrolgamer12](https://github.com/loltrolgamer12)

### 📬 Notificaciones- **Proyecto**: Sistema de Conjuntos Residenciales

- `GET /api/notifications` - Mis notificaciones (autenticado)- **Universidad**: Surcolombiana

- `POST /api/notifications` - Enviar notificación (Admin)

- `PUT /api/notifications/:id/read` - Marcar como leída---



### 💰 Pagos⭐ Si este proyecto te parece útil, ¡dale una estrella!

- `GET /api/payments` - Listar pagos (autenticado)
- `POST /api/payments` - Registrar pago (Admin)
- `PUT /api/payments/:id/pay` - Marcar como pagado (autenticado)

### 👥 Usuarios
- `GET /api/users` - Listar usuarios (Admin)
- `PUT /api/users/:id` - Actualizar usuario (Admin/propio)
- `DELETE /api/users/:id` - Eliminar usuario (Admin)

## 🔐 Uso con Autenticación

### Headers Requeridos
```javascript
// Para endpoints protegidos
headers: {
  'Authorization': 'Bearer ' + token,
  'Content-Type': 'application/json'
}
```

### Ejemplo con cURL
```bash
# Obtener token
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"Admin123!"}'

# Usar token en requests
curl -X GET http://localhost:3000/api/apartments \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Ejemplo con JavaScript/Fetch
```javascript
// Login y obtener token
const loginResponse = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'admin@test.com',
    password: 'Admin123!'
  })
});

const { data } = await loginResponse.json();
const token = data.token;

// Usar token para requests protegidos
const apartmentsResponse = await fetch('/api/apartments', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});

const apartments = await apartmentsResponse.json();
```

## 🧪 Testing

### Ejecutar Pruebas
```bash
# Todas las pruebas
npm test

# Pruebas específicas
npm run test:auth
npm run test:endpoints
npm run test:functional
npm run test:token

# Pruebas con cobertura
npm run test:coverage
```

### Resultados de Pruebas
```
✅ 25/25 pruebas de autenticación con token
✅ 23/23 pruebas de endpoints completas
✅ 22/23 pruebas funcionales del sistema
✅ 95.7% de tasa de éxito general
```

## 🚀 Despliegue

### Desarrollo
```bash
npm run dev
```

### Producción con PM2
```bash
# Instalar PM2 globalmente
npm install -g pm2

# Iniciar con PM2
pm2 start ecosystem.config.js

# Comandos PM2
pm2 status
pm2 logs residential-complex
pm2 restart residential-complex
pm2 stop residential-complex
```

### Docker (Opcional)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

## 📊 Monitoreo y Logs

### Winston Logging
```javascript
// Los logs se guardan en:
logs/app.log        // Logs generales
logs/error.log      // Solo errores
logs/access.log     // Logs de acceso HTTP
```

### Health Check
```bash
# Verificar estado del servidor
curl http://localhost:3000/health

# Respuesta esperada
{
  "status": "OK",
  "timestamp": "2025-09-16T02:14:52.123Z",
  "uptime": "1h 23m 45s",
  "version": "1.0.0"
}
```

## 📚 Documentación Adicional

- **API Documentation**: `/api-docs` (Swagger UI)
- **Validación del Sistema**: `VALIDATION_REPORT.md`
- **Pruebas con Token**: `TOKEN_VALIDATION_REPORT.md`
- **Arquitectura**: `docs/ARCHITECTURE.md`

## 🤝 Contribuir

1. Fork el proyecto
2. Crear branch para feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit los cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push al branch (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo `LICENSE` para detalles.

## 👨‍💻 Autor

- **GitHub**: [@loltrolgamer12](https://github.com/loltrolgamer12)
- **Proyecto**: Sistema de Conjuntos Residenciales
- **Universidad**: Surcolombiana

Desarrollado con ❤️ para la gestión eficiente de conjuntos residenciales.

---

## 🆘 Soporte

¿Tienes preguntas o necesitas ayuda?

- **Issues**: [GitHub Issues](https://github.com/loltrolgamer12/residential_complex/issues)
- **Wiki**: [Documentación completa](https://github.com/loltrolgamer12/residential_complex/wiki)
- **Email**: soporte@residentialcomplex.com

## 🔄 Changelog

### v1.0.0 (2025-09-16)
- ✅ Sistema completo de autenticación JWT
- ✅ Gestión de apartamentos y usuarios
- ✅ Sistema Airbnb con notificaciones automáticas
- ✅ Mantenimiento con notificación masiva
- ✅ Reportes de daños con notificación automática
- ✅ Sistema de pagos y administración
- ✅ 25 pruebas automatizadas exitosas
- ✅ Documentación completa
- ✅ Configuración de producción con PM2

---

⭐ Si este proyecto te parece útil, ¡dale una estrella!

# API Residencial

## Airbnb Guests

- POST `/api/airbnb/register` — Registrar huésped Airbnb
- POST `/api/airbnb/checkin/:id` — Check-in de huésped
- POST `/api/airbnb/checkout/:id` — Check-out de huésped
- GET `/api/airbnb/active` — Listar huéspedes activos
- DELETE `/api/airbnb/:id` — Eliminar huésped Airbnb