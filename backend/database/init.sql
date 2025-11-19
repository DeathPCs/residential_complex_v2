-- =========================================
-- 🏢 Sistema de Gestión de Conjuntos Residenciales
-- Script de Inicialización de Base de Datos PostgreSQL
-- =========================================

-- Configuración inicial
SET timezone = 'America/Bogota';
SET client_encoding = 'UTF8';

-- Crear extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =========================================
-- TABLA: users
-- Gestión de usuarios con diferentes roles
-- =========================================
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    cedula VARCHAR(20) UNIQUE NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'owner', 'tenant', 'security')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices para users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_cedula ON users(cedula);
CREATE INDEX idx_users_is_active ON users(is_active);

-- =========================================
-- TABLA: apartments
-- Gestión de apartamentos del conjunto
-- =========================================
CREATE TABLE IF NOT EXISTS apartments (
    id BIGSERIAL PRIMARY KEY,
    number VARCHAR(50) UNIQUE NOT NULL,
    tower VARCHAR(100) NOT NULL,
    floor INTEGER NOT NULL,
    type VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'available' 
        CHECK (status IN ('owner_occupied', 'rented', 'available', 'maintenance')),
    owner_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices para apartments
CREATE INDEX idx_apartments_number ON apartments(number);
CREATE INDEX idx_apartments_status ON apartments(status);
CREATE INDEX idx_apartments_owner_id ON apartments(owner_id);
CREATE INDEX idx_apartments_tower ON apartments(tower);

-- =========================================
-- TABLA: airbnb_guests
-- Sistema Airbnb con notificaciones automáticas
-- =========================================
CREATE TABLE IF NOT EXISTS airbnb_guests (
    id BIGSERIAL PRIMARY KEY,
    apartment_id BIGINT NOT NULL REFERENCES apartments(id) ON DELETE CASCADE,
    guest_name VARCHAR(255) NOT NULL,
    guest_cedula VARCHAR(20) NOT NULL,
    number_of_guests INTEGER NOT NULL CHECK (number_of_guests > 0 AND number_of_guests <= 20),
    check_in_date DATE NOT NULL,
    check_out_date DATE NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending' 
        CHECK (status IN ('pending', 'checked_in', 'checked_out', 'cancelled')),
    registered_by BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    check_in_time TIMESTAMP WITH TIME ZONE,
    check_out_time TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Validaciones de fechas
    CONSTRAINT check_dates CHECK (check_out_date > check_in_date),
    CONSTRAINT check_future_dates CHECK (check_in_date >= CURRENT_DATE)
);

-- Índices para airbnb_guests
CREATE INDEX idx_airbnb_guests_apartment_id ON airbnb_guests(apartment_id);
CREATE INDEX idx_airbnb_guests_status ON airbnb_guests(status);
CREATE INDEX idx_airbnb_guests_dates ON airbnb_guests(check_in_date, check_out_date);
CREATE INDEX idx_airbnb_guests_cedula ON airbnb_guests(guest_cedula);

-- =========================================
-- TABLA: maintenance
-- Sistema de mantenimientos con notificación masiva
-- =========================================
CREATE TABLE IF NOT EXISTS maintenance (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    area VARCHAR(100) NOT NULL 
        CHECK (area IN ('pool', 'gym', 'elevator', 'common_areas', 'parking', 'garden', 'playground', 'security', 'other')),
    status VARCHAR(50) NOT NULL DEFAULT 'pending' 
        CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
    priority VARCHAR(20) NOT NULL DEFAULT 'medium' 
        CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    scheduled_date DATE,
    start_date TIMESTAMP WITH TIME ZONE,
    completion_date TIMESTAMP WITH TIME ZONE,
    estimated_cost DECIMAL(12,2),
    actual_cost DECIMAL(12,2),
    assigned_to VARCHAR(255),
    created_by BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices para maintenance
CREATE INDEX idx_maintenance_status ON maintenance(status);
CREATE INDEX idx_maintenance_area ON maintenance(area);
CREATE INDEX idx_maintenance_priority ON maintenance(priority);
CREATE INDEX idx_maintenance_scheduled_date ON maintenance(scheduled_date);
CREATE INDEX idx_maintenance_created_by ON maintenance(created_by);

-- =========================================
-- TABLA: damage_reports
-- Reportes de daños con notificación automática
-- =========================================
CREATE TABLE IF NOT EXISTS damage_reports (
    id BIGSERIAL PRIMARY KEY,
    apartment_id BIGINT NOT NULL REFERENCES apartments(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    priority VARCHAR(20) NOT NULL DEFAULT 'medium' 
        CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status VARCHAR(50) NOT NULL DEFAULT 'reported' 
        CHECK (status IN ('reported', 'acknowledged', 'in_progress', 'resolved', 'closed')),
    reported_by BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    assigned_to BIGINT REFERENCES users(id) ON DELETE SET NULL,
    estimated_cost DECIMAL(12,2),
    actual_cost DECIMAL(12,2),
    resolution_notes TEXT,
    resolved_at TIMESTAMP WITH TIME ZONE,
    images JSONB, -- Array de URLs de imágenes
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices para damage_reports
CREATE INDEX idx_damage_reports_apartment_id ON damage_reports(apartment_id);
CREATE INDEX idx_damage_reports_status ON damage_reports(status);
CREATE INDEX idx_damage_reports_priority ON damage_reports(priority);
CREATE INDEX idx_damage_reports_reported_by ON damage_reports(reported_by);
CREATE INDEX idx_damage_reports_assigned_to ON damage_reports(assigned_to);

-- =========================================
-- TABLA: notifications
-- Sistema completo de notificaciones
-- =========================================
CREATE TABLE IF NOT EXISTS notifications (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL 
        CHECK (type IN ('general', 'maintenance', 'payment', 'airbnb_checkin', 'airbnb_checkout', 'damage_report', 'system')),
    recipient_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    recipient_type VARCHAR(20) DEFAULT 'individual' 
        CHECK (recipient_type IN ('individual', 'all', 'owners', 'tenants', 'security')),
    is_read BOOLEAN DEFAULT false,
    priority VARCHAR(20) NOT NULL DEFAULT 'medium' 
        CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    related_entity_type VARCHAR(50), -- 'airbnb_guest', 'maintenance', 'damage_report', 'payment'
    related_entity_id BIGINT,
    sent_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
    scheduled_for TIMESTAMP WITH TIME ZONE,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices para notifications
CREATE INDEX idx_notifications_recipient_id ON notifications(recipient_id);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_sent_at ON notifications(sent_at);
CREATE INDEX idx_notifications_priority ON notifications(priority);

-- =========================================
-- TABLA: payments
-- Sistema de pagos y mensualidades
-- =========================================
CREATE TABLE IF NOT EXISTS payments (
    id BIGSERIAL PRIMARY KEY,
    apartment_id BIGINT NOT NULL REFERENCES apartments(id) ON DELETE CASCADE,
    amount DECIMAL(12,2) NOT NULL CHECK (amount > 0),
    description TEXT NOT NULL DEFAULT 'Cuota de administración mensual',
    due_date DATE NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending' 
        CHECK (status IN ('pending', 'paid', 'overdue', 'cancelled')),
    payment_date TIMESTAMP WITH TIME ZONE,
    payment_method VARCHAR(50) CHECK (payment_method IN ('cash', 'transfer', 'card', 'check', 'other')),
    reference_number VARCHAR(100),
    late_fee DECIMAL(12,2) DEFAULT 0,
    total_amount DECIMAL(12,2) GENERATED ALWAYS AS (amount + COALESCE(late_fee, 0)) STORED,
    notes TEXT,
    created_by BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    paid_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices para payments
CREATE INDEX idx_payments_apartment_id ON payments(apartment_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_due_date ON payments(due_date);
CREATE INDEX idx_payments_payment_date ON payments(payment_date);
CREATE INDEX idx_payments_created_by ON payments(created_by);

-- =========================================
-- TABLA: audit_log
-- Registro de auditoría del sistema
-- =========================================
CREATE TABLE IF NOT EXISTS audit_log (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id BIGINT,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices para audit_log
CREATE INDEX idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX idx_audit_log_action ON audit_log(action);
CREATE INDEX idx_audit_log_entity_type ON audit_log(entity_type);
CREATE INDEX idx_audit_log_timestamp ON audit_log(timestamp);

-- =========================================
-- FUNCIONES Y TRIGGERS
-- =========================================

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para actualizar updated_at
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_apartments_updated_at 
    BEFORE UPDATE ON apartments 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_airbnb_guests_updated_at 
    BEFORE UPDATE ON airbnb_guests 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_maintenance_updated_at 
    BEFORE UPDATE ON maintenance 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_damage_reports_updated_at 
    BEFORE UPDATE ON damage_reports 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_payments_updated_at 
    BEFORE UPDATE ON payments 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Función para detectar pagos vencidos automáticamente
CREATE OR REPLACE FUNCTION check_overdue_payments()
RETURNS TRIGGER AS $$
BEGIN
    -- Actualizar pagos vencidos
    UPDATE payments 
    SET status = 'overdue' 
    WHERE due_date < CURRENT_DATE 
    AND status = 'pending';
    
    RETURN NULL;
END;
$$ LANGUAGE 'plpgsql';

-- Trigger diario para verificar pagos vencidos
-- (Se ejecutaría con un cron job o similar en producción)

-- =========================================
-- VISTAS ÚTILES
-- =========================================

-- Vista de huéspedes activos para seguridad
CREATE OR REPLACE VIEW active_airbnb_guests AS
SELECT 
    ag.id,
    ag.guest_name,
    ag.guest_cedula,
    ag.number_of_guests,
    ag.check_in_date,
    ag.check_out_date,
    ag.status,
    a.number as apartment_number,
    a.tower,
    u.name as owner_name
FROM airbnb_guests ag
JOIN apartments a ON ag.apartment_id = a.id
LEFT JOIN users u ON a.owner_id = u.id
WHERE ag.status IN ('checked_in', 'pending')
AND ag.check_out_date >= CURRENT_DATE;

-- Vista de pagos pendientes por apartamento
CREATE OR REPLACE VIEW pending_payments_summary AS
SELECT 
    a.id as apartment_id,
    a.number as apartment_number,
    a.tower,
    COUNT(p.id) as pending_count,
    SUM(p.amount) as total_pending,
    MIN(p.due_date) as oldest_due_date,
    u.name as owner_name,
    u.email as owner_email
FROM apartments a
LEFT JOIN payments p ON a.id = p.apartment_id AND p.status = 'pending'
LEFT JOIN users u ON a.owner_id = u.id
GROUP BY a.id, a.number, a.tower, u.name, u.email;

-- Vista de reportes de daños por prioridad
CREATE OR REPLACE VIEW damage_reports_summary AS
SELECT 
    dr.priority,
    dr.status,
    COUNT(*) as report_count,
    a.tower,
    AVG(EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - dr.created_at))/86400)::INTEGER as avg_days_open
FROM damage_reports dr
JOIN apartments a ON dr.apartment_id = a.id
WHERE dr.status != 'closed'
GROUP BY dr.priority, dr.status, a.tower
ORDER BY dr.priority DESC, report_count DESC;

-- =========================================
-- COMENTARIOS EN TABLAS
-- =========================================
COMMENT ON TABLE users IS 'Usuarios del sistema con diferentes roles: admin, owner, tenant, security';
COMMENT ON TABLE apartments IS 'Apartamentos del conjunto residencial';
COMMENT ON TABLE airbnb_guests IS 'Huéspedes Airbnb con sistema de notificaciones automáticas';
COMMENT ON TABLE maintenance IS 'Mantenimientos programados con notificación masiva';
COMMENT ON TABLE damage_reports IS 'Reportes de daños con notificación automática al propietario';
COMMENT ON TABLE notifications IS 'Sistema completo de notificaciones del conjunto';
COMMENT ON TABLE payments IS 'Pagos de administración y mensualidades';
COMMENT ON TABLE audit_log IS 'Registro de auditoría de todas las acciones del sistema';

-- =========================================
-- FINALIZACIÓN
-- =========================================
COMMIT;

-- Mensaje de confirmación
SELECT '✅ Base de datos inicializada exitosamente para Sistema de Conjuntos Residenciales' as mensaje;