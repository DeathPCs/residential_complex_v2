# 📚 Documentación del Backend - Sistema Conjuntos Residenciales

## 🚀 Estado del Sistema

✅ **Backend completamente funcional y listo para producción**

- Base de datos PostgreSQL (NeonDB) configurada
- ORM Prisma integrado y funcionando
- Todos los endpoints CRUD operativos
- Autenticación JWT implementada
- Tests de integración pasando
- Middleware de seguridad y validación activos

## 🔧 Configuración de Producción

### Variables de Entorno (.env.production)

```bash
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://neondb_owner:npg_rvSBHMx0koZ2@ep-spring-cherry-ad05fwjs-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
JWT_SECRET=residential-complex-super-secret-key-2024
JWT_EXPIRES_IN=24h
CORS_ORIGIN=*
```

### Iniciar el Servidor

```bash
# Desarrollo
npm run dev

# Producción
npm start
```

### URL Base
```
http://localhost:3000
```

## 👤 Credenciales de Prueba

### Administrador
- **Email:** admin@residential.com
- **Password:** Admin123
- **Rol:** admin

### Propietario
- **Email:** owner@residential.com
- **Password:** Owner123
- **Rol:** owner

## 📋 Endpoints Disponibles

### 🔐 Autenticación

#### POST /api/auth/register
Registrar un nuevo usuario

**Request:**
```json
{
  "name": "Juan Pérez",
  "email": "juan@example.com",
  "cedula": "12345678",
  "phone": "3001234567",
  "password": "Password123",
  "role": "tenant"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "uuid-here",
      "name": "Juan Pérez",
      "email": "juan@example.com",
      "role": "tenant",
      "status": "pending"
    }
  }
}
```

#### POST /api/auth/login
Iniciar sesión

**Request:**
```json
{
  "email": "admin@residential.com",
  "password": "Admin123"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "uuid-here",
      "name": "Administrador",
      "email": "admin@residential.com",
      "role": "admin"
    }
  }
}
```

### 👥 Usuarios

#### GET /api/users
Obtener lista de usuarios (requiere autenticación)

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters:**
- `email` (opcional): filtrar por email
- `page` (opcional, default: 1): número de página
- `limit` (opcional, default: 10): resultados por página

**Response (200):**
```json
{
  "success": true,
  "data": [...],
  "total": 50,
  "page": 1,
  "limit": 10
}
```

#### PUT /api/users/:id
Actualizar usuario

**Headers:**
```
Authorization: Bearer {token}
```

**Request:**
```json
{
  "name": "Juan Actualizado",
  "phone": "3009876543"
}
```

#### DELETE /api/users/:id
Eliminar usuario

### 🏢 Apartamentos

#### GET /api/apartments
Obtener todos los apartamentos

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-here",
      "number": "101",
      "tower": "A",
      "floor": 1,
      "status": "occupied",
      "type": "residential",
      "owner": {
        "id": "uuid-here",
        "name": "Juan Propietario"
      }
    }
  ]
}
```

#### POST /api/apartments
Crear nuevo apartamento (admin/owner)

**Headers:**
```
Authorization: Bearer {token}
```

**Request:**
```json
{
  "number": "202",
  "tower": "B",
  "floor": 2,
  "type": "residential",
  "status": "vacant"
}
```

### 🏠 Huéspedes Airbnb

#### POST /api/airbnb/guests
Registrar huésped Airbnb (admin/owner)

**Headers:**
```
Authorization: Bearer {token}
```

**Request:**
```json
{
  "apartmentId": "uuid-here",
  "guestName": "John Doe",
  "guestCedula": "11223344",
  "numberOfGuests": 2,
  "checkInDate": "2025-10-15T14:00:00Z",
  "checkOutDate": "2025-10-20T10:00:00Z"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "uuid-here",
    "guestName": "John Doe",
    "status": "pending",
    "checkInDate": "2025-10-15T14:00:00Z",
    "checkOutDate": "2025-10-20T10:00:00Z"
  },
  "message": "Huésped Airbnb registrado exitosamente."
}
```

#### PUT /api/airbnb/guests/:id/checkin
Realizar check-in (admin/security)

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid-here",
    "status": "checked_in"
  },
  "message": "Check-in realizado por portería."
}
```

#### GET /api/airbnb/guests/active
Obtener huéspedes activos (admin/security)

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "success": true,
  "data": [...]
}
```

#### DELETE /api/airbnb/guests/:id
Eliminar huésped (admin/owner)

### 🔧 Mantenimiento

#### POST /api/maintenance
Crear solicitud de mantenimiento (admin)

**Headers:**
```
Authorization: Bearer {token}
```

**Request:**
```json
{
  "title": "Limpieza de piscina",
  "description": "Mantenimiento mensual",
  "area": "Zonas comunes",
  "scheduledDate": "2025-10-20T09:00:00Z"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "uuid-here",
    "title": "Limpieza de piscina",
    "status": "pending",
    "area": "Zonas comunes"
  },
  "message": "Mantenimiento programado."
}
```

#### GET /api/maintenance
Obtener todas las solicitudes de mantenimiento

**Headers:**
```
Authorization: Bearer {token}
```

#### PUT /api/maintenance/:id/status
Actualizar estado del mantenimiento (admin)

**Headers:**
```
Authorization: Bearer {token}
```

**Request:**
```json
{
  "status": "in_progress"
}
```

### ⚠️ Reportes de Daños

#### POST /api/damage-reports
Crear reporte de daño

**Headers:**
```
Authorization: Bearer {token}
```

**Request:**
```json
{
  "apartmentId": "uuid-here",
  "title": "Ventana rota",
  "description": "La ventana de la sala está agrietada",
  "priority": "high",
  "images": []
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "uuid-here",
    "title": "Ventana rota",
    "status": "reported",
    "priority": "high"
  }
}
```

#### GET /api/damage-reports/my-reports
Obtener reportes del usuario actual

**Headers:**
```
Authorization: Bearer {token}
```

### 🔔 Notificaciones

#### GET /api/notifications
Obtener notificaciones del usuario

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-here",
      "message": "Nuevo huésped registrado",
      "type": "airbnb_checkin",
      "read": false,
      "createdAt": "2025-10-14T10:30:00Z"
    }
  ]
}
```

#### POST /api/notifications
Crear notificación (admin)

**Headers:**
```
Authorization: Bearer {token}
```

**Request:**
```json
{
  "userId": "uuid-here",
  "message": "Mantenimiento programado para mañana",
  "type": "maintenance"
}
```

### 💰 Pagos

#### POST /api/payments
Crear registro de pago (admin)

**Headers:**
```
Authorization: Bearer {token}
```

**Request:**
```json
{
  "userId": "uuid-here",
  "amount": 150000,
  "concept": "Administración mes de octubre",
  "dueDate": "2025-10-31T23:59:59Z"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "uuid-here",
    "amount": 150000,
    "status": "pending",
    "dueDate": "2025-10-31T23:59:59Z"
  }
}
```

#### PUT /api/payments/:id/pay
Marcar pago como realizado

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid-here",
    "status": "paid",
    "paidDate": "2025-10-14T15:30:00Z"
  }
}
```

## 🔒 Roles y Permisos

### Roles Disponibles
- `admin`: Acceso completo al sistema
- `owner`: Propietario de apartamento(s)
- `tenant`: Inquilino/residente
- `security`: Personal de seguridad

### Permisos por Endpoint

| Endpoint | admin | owner | tenant | security |
|----------|-------|-------|--------|----------|
| POST /api/apartments | ✅ | ✅ | ❌ | ❌ |
| POST /api/airbnb/guests | ✅ | ✅ | ❌ | ❌ |
| PUT /api/airbnb/guests/:id/checkin | ✅ | ❌ | ❌ | ✅ |
| POST /api/maintenance | ✅ | ❌ | ❌ | ❌ |
| POST /api/damage-reports | ✅ | ✅ | ✅ | ❌ |
| POST /api/notifications | ✅ | ❌ | ❌ | ❌ |
| POST /api/payments | ✅ | ❌ | ❌ | ❌ |

## 🛡️ Seguridad

### Headers Requeridos

Todos los endpoints protegidos requieren:
```
Authorization: Bearer {JWT_TOKEN}
```

### Formato de Errores

```json
{
  "success": false,
  "error": "Mensaje de error",
  "statusCode": 400
}
```

### Códigos de Estado HTTP

- `200`: Éxito
- `201`: Recurso creado
- `400`: Solicitud inválida
- `401`: No autenticado
- `403`: No autorizado (sin permisos)
- `404`: Recurso no encontrado
- `500`: Error del servidor

## 📊 Modelo de Datos (Prisma Schema)

### User
```prisma
model User {
  id            String   @id @default(uuid())
  name          String
  email         String   @unique
  cedula        String   @unique
  phone         String?
  role          String   @default("resident")
  status        String   @default("pending")
  password      String
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}
```

### Apartment
```prisma
model Apartment {
  id        String   @id @default(uuid())
  number    String
  tower     String
  floor     Int
  ownerId   String?
  status    String   @default("vacant")
  type      String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

## 🧪 Testing

### Ejecutar Tests
```bash
# Todos los tests
npm test

# Tests específicos
npm test -- tests/integration/prisma-integration.test.js
```

### Coverage
Los tests incluyen:
- Autenticación y registro
- CRUD de todas las entidades
- Validación de permisos
- Manejo de errores
- Validación de datos

## 🚀 Despliegue

### Comandos de Producción

```bash
# 1. Instalar dependencias
npm install

# 2. Generar cliente de Prisma
npx prisma generate

# 3. Aplicar migraciones
npx prisma migrate deploy

# 4. Poblar datos iniciales (opcional)
node scripts/setup-production.js

# 5. Iniciar servidor
npm start
```

### Health Check

```bash
GET /health
```

**Response:**
```json
{
  "status": "OK",
  "environment": "production",
  "timestamp": "2025-10-14T12:00:00.000Z",
  "database": "connected"
}
```

## 📝 Notas para el Frontend

1. **Autenticación**: Guardar el token JWT en localStorage o cookies
2. **Interceptores**: Configurar axios/fetch para incluir el token en todas las peticiones
3. **Manejo de Errores**: Implementar manejo global de errores 401 (redirigir a login)
4. **CORS**: Ya está configurado para aceptar peticiones de cualquier origen en producción
5. **Fechas**: Todas las fechas están en formato ISO 8601 (UTC)

## 🐛 Troubleshooting

### Error de conexión a BD
```bash
# Verificar que DATABASE_URL esté configurada correctamente
echo $DATABASE_URL
```

### Regenerar Prisma Client
```bash
npx prisma generate
```

### Ver logs del servidor
```bash
# Los logs se muestran en consola
tail -f logs/app.log
```

## 📞 Soporte

Para problemas o dudas:
- Revisar logs del servidor
- Verificar configuración de .env
- Comprobar que las migraciones estén aplicadas: `npx prisma migrate status`

---

**✨ El backend está 100% funcional y listo para que el frontend comience su desarrollo!**
