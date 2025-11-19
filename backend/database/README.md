# 🗄️ Database - Sistema Conjuntos Residenciales

Esta carpeta contiene todos los scripts y archivos relacionados con la base de datos PostgreSQL del sistema.

## 📁 Estructura de Archivos

```
database/
├── README.md              # Este archivo
├── init.sql              # Script de inicialización de BD
├── sample_data.sql       # Datos de ejemplo
├── setup.sh             # Script de configuración automática
├── migrations/           # Migraciones de base de datos
└── backups/             # Respaldos de base de datos
```

## 🚀 Configuración Rápida

### Opción 1: Script Automático (Recomendado)
```bash
# Ejecutar desde el directorio raíz del proyecto
./database/setup.sh
```

### Opción 2: Configuración Manual
```bash
# 1. Crear base de datos
createdb residential_complex

# 2. Ejecutar scripts de inicialización
psql -d residential_complex -f database/init.sql
psql -d residential_complex -f database/sample_data.sql
```

## 🏗️ Estructura de la Base de Datos

### Tablas Principales

#### 👥 `users`
- Gestión de usuarios con 4 roles: admin, owner, tenant, security
- Autenticación con hash de contraseñas
- Campos: id, name, email, password_hash, cedula, phone, role, is_active

#### 🏠 `apartments`
- Información de apartamentos del conjunto
- Estados: owner_occupied, rented, available, maintenance
- Campos: id, number, tower, floor, type, status, owner_id

#### ✈️ `airbnb_guests`
- Sistema completo de huéspedes Airbnb
- Estados: pending, checked_in, checked_out, cancelled
- Campos: id, apartment_id, guest_name, guest_cedula, dates, status

#### 🔧 `maintenance`
- Mantenimientos programados con prioridades
- Áreas: pool, gym, elevator, common_areas, etc.
- Estados: pending, in_progress, completed, cancelled

#### ⚠️ `damage_reports`
- Reportes de daños con seguimiento
- Prioridades: low, medium, high, urgent
- Estados: reported, acknowledged, in_progress, resolved, closed

#### 📬 `notifications`
- Sistema completo de notificaciones
- Tipos: general, maintenance, payment, airbnb, damage_report
- Soporte para notificaciones individuales y masivas

#### 💰 `payments`
- Pagos de administración y mensualidades
- Estados: pending, paid, overdue, cancelled
- Seguimiento de fechas de vencimiento y pago

#### 📝 `audit_log`
- Registro de auditoría de todas las acciones
- Campos: user_id, action, entity_type, old_values, new_values, timestamp

### Vistas Útiles

#### `active_airbnb_guests`
```sql
-- Vista para control de seguridad
SELECT * FROM active_airbnb_guests;
```

#### `pending_payments_summary`
```sql
-- Resumen de pagos pendientes por apartamento
SELECT * FROM pending_payments_summary;
```

#### `damage_reports_summary`
```sql
-- Resumen de reportes de daños por prioridad
SELECT * FROM damage_reports_summary;
```

### Funciones y Triggers

- **`update_updated_at_column()`**: Actualiza automáticamente el campo `updated_at`
- **`check_overdue_payments()`**: Detecta pagos vencidos automáticamente
- **Triggers**: Mantienen la integridad de datos y auditoría

## 🔧 Configuración de Conexión

### Variables de Entorno Requeridas

```env
# Base de Datos
DB_HOST=localhost
DB_PORT=5432
DB_NAME=residential_complex
DB_USER=postgres
DB_PASSWORD=your_password

# Para Testing
TEST_DB_NAME=residential_complex_test
```

### Configuración en Node.js

```javascript
// config/environment.js
const dbConfig = {
  development: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres'
  }
};
```

## 👥 Usuarios de Prueba

Los datos de ejemplo incluyen usuarios para testing:

| Rol | Email | Contraseña | Descripción |
|-----|-------|------------|-------------|
| Admin | admin@residencial.com | 123456 | Administrador del sistema |
| Owner | juan.perez@email.com | 123456 | Propietario de apartamento |
| Tenant | ana.martinez@email.com | 123456 | Inquilino/arrendatario |
| Security | roberto.seguridad@email.com | 123456 | Personal de seguridad |

## 📊 Datos de Ejemplo Incluidos

- **8 usuarios** con diferentes roles
- **12 apartamentos** en 2 torres
- **5 huéspedes Airbnb** (activos e históricos)
- **4 mantenimientos** programados
- **4 reportes de daños** con diferentes prioridades
- **6 notificaciones** del sistema
- **9 pagos** (pendientes y realizados)
- **Registros de auditoría** de ejemplo

## 🔄 Migraciones

### Crear Nueva Migración
```bash
# Crear archivo de migración
touch database/migrations/$(date +%Y%m%d_%H%M%S)_descripcion_cambio.sql
```

### Aplicar Migración
```bash
psql -d residential_complex -f database/migrations/archivo_migracion.sql
```

## 💾 Respaldos

### Crear Respaldo
```bash
# Respaldo completo
pg_dump -h localhost -U postgres residential_complex > database/backups/backup_$(date +%Y%m%d_%H%M%S).sql

# Solo estructura
pg_dump -h localhost -U postgres --schema-only residential_complex > database/backups/schema_$(date +%Y%m%d_%H%M%S).sql

# Solo datos
pg_dump -h localhost -U postgres --data-only residential_complex > database/backups/data_$(date +%Y%m%d_%H%M%S).sql
```

### Restaurar Respaldo
```bash
# Restaurar respaldo completo
psql -h localhost -U postgres residential_complex < database/backups/backup_archivo.sql
```

## 🔍 Consultas Útiles

### Verificar Estado del Sistema
```sql
-- Estadísticas generales
SELECT 
    'Usuarios' as tabla, COUNT(*) as total FROM users
UNION ALL
SELECT 'Apartamentos', COUNT(*) FROM apartments
UNION ALL
SELECT 'Huéspedes Activos', COUNT(*) FROM airbnb_guests WHERE status = 'checked_in'
UNION ALL
SELECT 'Mantenimientos Pendientes', COUNT(*) FROM maintenance WHERE status = 'pending'
UNION ALL
SELECT 'Reportes Abiertos', COUNT(*) FROM damage_reports WHERE status != 'closed'
UNION ALL
SELECT 'Pagos Pendientes', COUNT(*) FROM payments WHERE status = 'pending';
```

### Huéspedes Activos para Seguridad
```sql
SELECT 
    ag.guest_name,
    ag.guest_cedula,
    a.number as apartment,
    a.tower,
    ag.check_out_date
FROM airbnb_guests ag
JOIN apartments a ON ag.apartment_id = a.id
WHERE ag.status = 'checked_in'
ORDER BY ag.check_out_date;
```

### Pagos Vencidos
```sql
SELECT 
    a.number as apartment,
    a.tower,
    p.amount,
    p.due_date,
    CURRENT_DATE - p.due_date as days_overdue,
    u.name as owner,
    u.email
FROM payments p
JOIN apartments a ON p.apartment_id = a.id
LEFT JOIN users u ON a.owner_id = u.id
WHERE p.status = 'pending' 
AND p.due_date < CURRENT_DATE
ORDER BY days_overdue DESC;
```

## 🚨 Troubleshooting

### Problemas Comunes

#### Error de Conexión
```bash
# Verificar que PostgreSQL esté ejecutándose
sudo service postgresql status

# Verificar configuración de conexión
psql -h localhost -U postgres -d residential_complex -c "SELECT version();"
```

#### Error de Permisos
```bash
# Otorgar permisos al usuario
sudo -u postgres createuser --interactive
```

#### Base de Datos No Existe
```bash
# Crear base de datos manualmente
sudo -u postgres createdb residential_complex

# O usar el script de setup
./database/setup.sh
```

## 📚 Referencias

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Sequelize ORM](https://sequelize.org/)
- [SQL Style Guide](https://www.sqlstyle.guide/)

---

Para más información, consulte la documentación principal del proyecto en el directorio raíz.