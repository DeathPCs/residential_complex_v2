-- =========================================
-- 🏢 Datos de Ejemplo - Sistema Conjuntos Residenciales
-- Datos iniciales para desarrollo y testing
-- =========================================

-- Configuración inicial
SET timezone = 'America/Bogota';

-- =========================================
-- USUARIOS DE EJEMPLO
-- Contraseñas hasheadas con bcrypt (password: 123456)
-- =========================================

-- Administrador del sistema
INSERT INTO users (name, email, password_hash, cedula, phone, role, is_active) VALUES
('Administrador General', 'admin@residencial.com', '$2b$12$LQv3c1yqBwEHFurhHSh5XOg.pM5yaM6Q5Q5.5jJ5.wJjKqM5J5j5j', '12345678', '+57 300 123 4567', 'admin', true);

-- Propietarios
INSERT INTO users (name, email, password_hash, cedula, phone, role, is_active) VALUES
('Juan Pérez García', 'juan.perez@email.com', '$2b$12$LQv3c1yqBwEHFurhHSh5XOg.pM5yaM6Q5Q5.5jJ5.wJjKqM5J5j5j', '87654321', '+57 301 234 5678', 'owner', true),
('María González López', 'maria.gonzalez@email.com', '$2b$12$LQv3c1yqBwEHFurhHSh5XOg.pM5yaM6Q5Q5.5jJ5.wJjKqM5J5j5j', '11223344', '+57 302 345 6789', 'owner', true),
('Carlos Rodríguez Martín', 'carlos.rodriguez@email.com', '$2b$12$LQv3c1yqBwEHFurhHSh5XOg.pM5yaM6Q5Q5.5jJ5.wJjKqM5J5j5j', '55667788', '+57 303 456 7890', 'owner', true);

-- Inquilinos/Arrendatarios  
INSERT INTO users (name, email, password_hash, cedula, phone, role, is_active) VALUES
('Ana Martínez Silva', 'ana.martinez@email.com', '$2b$12$LQv3c1yqBwEHFurhHSh5XOg.pM5yaM6Q5Q5.5jJ5.wJjKqM5J5j5j', '99887766', '+57 304 567 8901', 'tenant', true),
('Pedro Sánchez Torres', 'pedro.sanchez@email.com', '$2b$12$LQv3c1yqBwEHFurhHSh5XOg.pM5yaM6Q5Q5.5jJ5.wJjKqM5J5j5j', '44556677', '+57 305 678 9012', 'tenant', true),
('Laura Fernández Castro', 'laura.fernandez@email.com', '$2b$12$LQv3c1yqBwEHFurhHSh5XOg.pM5yaM6Q5Q5.5jJ5.wJjKqM5J5j5j', '33445566', '+57 306 789 0123', 'tenant', true);

-- Personal de seguridad
INSERT INTO users (name, email, password_hash, cedula, phone, role, is_active) VALUES
('Roberto Gutiérrez Morales', 'roberto.seguridad@email.com', '$2b$12$LQv3c1yqBwEHFurhHSh5XOg.pM5yaM6Q5Q5.5jJ5.wJjKqM5J5j5j', '22334455', '+57 307 890 1234', 'security', true),
('Carmen López Herrera', 'carmen.porteria@email.com', '$2b$12$LQv3c1yqBwEHFurhHSh5XOg.pM5yaM6Q5Q5.5jJ5.wJjKqM5J5j5j', '77889900', '+57 308 901 2345', 'security', true);

-- =========================================
-- APARTAMENTOS DE EJEMPLO
-- =========================================

-- Torre A
INSERT INTO apartments (number, tower, floor, type, status, owner_id) VALUES
('101-A', 'Torre A', 1, '2 habitaciones', 'owner_occupied', 2),
('102-A', 'Torre A', 1, '3 habitaciones', 'rented', 3),
('103-A', 'Torre A', 1, '2 habitaciones', 'available', NULL),
('201-A', 'Torre A', 2, '3 habitaciones', 'owner_occupied', 4),
('202-A', 'Torre A', 2, '2 habitaciones', 'rented', 2),
('203-A', 'Torre A', 2, '2 habitaciones', 'maintenance', 3);

-- Torre B
INSERT INTO apartments (number, tower, floor, type, status, owner_id) VALUES
('101-B', 'Torre B', 1, '1 habitación', 'rented', 3),
('102-B', 'Torre B', 1, '2 habitaciones', 'owner_occupied', 4),
('103-B', 'Torre B', 1, '3 habitaciones', 'available', NULL),
('201-B', 'Torre B', 2, '2 habitaciones', 'rented', 2),
('202-B', 'Torre B', 2, '3 habitaciones', 'owner_occupied', 3),
('203-B', 'Torre B', 2, '1 habitación', 'rented', 4);

-- =========================================
-- HUÉSPEDES AIRBNB DE EJEMPLO
-- =========================================

-- Huéspedes activos
INSERT INTO airbnb_guests (apartment_id, guest_name, guest_cedula, number_of_guests, check_in_date, check_out_date, status, registered_by, notes) VALUES
(1, 'Juan Pérez', '12345678', 2, '2025-09-15', '2025-09-20', 'checked_in', 2, 'Huésped registrado por propietario'),
(2, 'María García', '87654321', 3, '2025-09-18', '2025-09-25', 'pending', 3, 'Check-in programado'),
(5, 'Carlos López', '11223344', 1, '2025-09-20', '2025-09-27', 'pending', 2, 'Huésped solo');

-- Huéspedes históricos
INSERT INTO airbnb_guests (apartment_id, guest_name, guest_cedula, number_of_guests, check_in_date, check_out_date, status, registered_by, check_in_time, check_out_time) VALUES
(1, 'Ana Rodríguez', '55667788', 2, '2025-09-01', '2025-09-08', 'checked_out', 2, '2025-09-01 15:00:00', '2025-09-08 11:00:00'),
(2, 'Pedro Martínez', '99887766', 4, '2025-08-25', '2025-09-01', 'checked_out', 3, '2025-08-25 16:00:00', '2025-09-01 10:30:00');

-- =========================================
-- MANTENIMIENTOS PROGRAMADOS
-- =========================================

INSERT INTO maintenance (title, description, area, status, priority, scheduled_date, created_by, estimated_cost, notes) VALUES
('Mantenimiento Piscina', 'Limpieza profunda y mantenimiento químico de la piscina principal', 'pool', 'pending', 'medium', '2025-01-15', 1, 500000, 'Mantenimiento mensual programado'),
('Revisión Ascensores Torre A', 'Inspección técnica y mantenimiento preventivo de ascensores', 'elevator', 'in_progress', 'high', '2025-01-10', 1, 800000, 'Mantenimiento trimestral obligatorio'),
('Jardinería Zonas Comunes', 'Poda, riego y mantenimiento de jardines y áreas verdes', 'garden', 'completed', 'low', '2025-01-05', 1, 300000, 'Completado satisfactoriamente'),
('Mantenimiento Gimnasio', 'Limpieza y calibración de equipos de gimnasio', 'gym', 'pending', 'medium', '2025-01-20', 1, 400000, 'Incluye equipos cardiovasculares');

-- =========================================
-- REPORTES DE DAÑOS
-- =========================================

INSERT INTO damage_reports (apartment_id, title, description, priority, status, reported_by, estimated_cost) VALUES
(1, 'Fuga en baño principal', 'Se presenta fuga de agua en la ducha del baño principal', 'high', 'reported', 5, 200000),
(2, 'Puerta de balcón no cierra', 'La puerta del balcón no cierra correctamente, posible problema en bisagras', 'medium', 'acknowledged', 6, 150000),
(5, 'Grifo de cocina gotea', 'El grifo de la cocina presenta goteo constante', 'low', 'in_progress', 5, 80000),
(10, 'Ventana rota sala', 'Vidrio de ventana principal presenta fisura', 'urgent', 'reported', 6, 300000);

-- =========================================
-- NOTIFICACIONES DEL SISTEMA
-- =========================================

-- Notificaciones generales
INSERT INTO notifications (title, message, type, recipient_type, priority, sent_by) VALUES
('Mantenimiento Piscina Programado', 'Se ha programado mantenimiento de la piscina para el 15 de enero. La piscina estará cerrada durante ese día.', 'maintenance', 'all', 'medium', 1),
('Reunión de Propietarios', 'Se convoca a reunión de propietarios para el próximo sábado a las 10:00 AM en el salón comunal.', 'general', 'owners', 'high', 1),
('Actualización Reglamento', 'Se ha actualizado el reglamento interno del conjunto. Consulte la cartelera principal.', 'general', 'all', 'low', 1);

-- Notificaciones específicas por usuario
INSERT INTO notifications (title, message, type, recipient_id, priority, related_entity_type, related_entity_id, sent_by) VALUES
('Nuevo huésped Airbnb', 'Se ha registrado un huésped en su apartamento 101-A del 15 al 20 de septiembre.', 'airbnb_checkin', 2, 'medium', 'airbnb_guest', 1, 1),
('Reporte de daño recibido', 'Se ha recibido un nuevo reporte de daño en el apartamento 101-A: Fuga en baño principal.', 'damage_report', 2, 'high', 'damage_report', 1, 1),
('Check-in realizado', 'El huésped Juan Pérez ha realizado check-in en el apartamento 101-A.', 'airbnb_checkin', 2, 'medium', 'airbnb_guest', 1, 7);

-- =========================================
-- PAGOS DE ADMINISTRACIÓN
-- =========================================

-- Pagos del mes actual
INSERT INTO payments (apartment_id, amount, description, due_date, status, created_by) VALUES
(1, 150000, 'Cuota de administración - Septiembre 2025', '2025-09-30', 'pending', 1),
(2, 180000, 'Cuota de administración - Septiembre 2025', '2025-09-30', 'paid', 1),
(3, 150000, 'Cuota de administración - Septiembre 2025', '2025-09-30', 'pending', 1),
(4, 200000, 'Cuota de administración - Septiembre 2025', '2025-09-30', 'paid', 1),
(5, 150000, 'Cuota de administración - Septiembre 2025', '2025-09-30', 'pending', 1),
(6, 150000, 'Cuota de administración - Septiembre 2025', '2025-09-30', 'overdue', 1);

-- Pagos históricos
INSERT INTO payments (apartment_id, amount, description, due_date, status, payment_date, payment_method, created_by, paid_by) VALUES
(1, 150000, 'Cuota de administración - Agosto 2025', '2025-08-31', 'paid', '2025-08-28 10:30:00', 'transfer', 1, 2),
(2, 180000, 'Cuota de administración - Agosto 2025', '2025-08-31', 'paid', '2025-08-25 14:15:00', 'transfer', 1, 3),
(4, 200000, 'Cuota de administración - Agosto 2025', '2025-08-31', 'paid', '2025-08-30 09:45:00', 'cash', 1, 4);

-- =========================================
-- REGISTRO DE AUDITORÍA DE EJEMPLO
-- =========================================

INSERT INTO audit_log (user_id, action, entity_type, entity_id, new_values, ip_address) VALUES
(1, 'CREATE', 'maintenance', 1, '{"title": "Mantenimiento Piscina", "area": "pool", "status": "pending"}', '192.168.1.100'),
(2, 'CREATE', 'airbnb_guest', 1, '{"guest_name": "Juan Pérez", "apartment_id": 1, "status": "pending"}', '192.168.1.101'),
(7, 'UPDATE', 'airbnb_guest', 1, '{"status": "checked_in", "check_in_time": "2025-09-15 15:00:00"}', '192.168.1.102'),
(5, 'CREATE', 'damage_report', 1, '{"title": "Fuga en baño principal", "priority": "high"}', '192.168.1.103');

-- =========================================
-- ACTUALIZAR SECUENCIAS
-- =========================================

-- Asegurar que las secuencias estén en el valor correcto
SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));
SELECT setval('apartments_id_seq', (SELECT MAX(id) FROM apartments));
SELECT setval('airbnb_guests_id_seq', (SELECT MAX(id) FROM airbnb_guests));
SELECT setval('maintenance_id_seq', (SELECT MAX(id) FROM maintenance));
SELECT setval('damage_reports_id_seq', (SELECT MAX(id) FROM damage_reports));
SELECT setval('notifications_id_seq', (SELECT MAX(id) FROM notifications));
SELECT setval('payments_id_seq', (SELECT MAX(id) FROM payments));
SELECT setval('audit_log_id_seq', (SELECT MAX(id) FROM audit_log));

-- =========================================
-- VERIFICACIÓN DE DATOS
-- =========================================

-- Verificar que los datos se insertaron correctamente
SELECT 
    'Usuarios' as tabla, COUNT(*) as registros FROM users
UNION ALL
SELECT 
    'Apartamentos' as tabla, COUNT(*) as registros FROM apartments
UNION ALL
SELECT 
    'Huéspedes Airbnb' as tabla, COUNT(*) as registros FROM airbnb_guests
UNION ALL
SELECT 
    'Mantenimientos' as tabla, COUNT(*) as registros FROM maintenance
UNION ALL
SELECT 
    'Reportes de Daños' as tabla, COUNT(*) as registros FROM damage_reports
UNION ALL
SELECT 
    'Notificaciones' as tabla, COUNT(*) as registros FROM notifications
UNION ALL
SELECT 
    'Pagos' as tabla, COUNT(*) as registros FROM payments
UNION ALL
SELECT 
    'Auditoría' as tabla, COUNT(*) as registros FROM audit_log;

-- =========================================
-- USUARIOS DE PRUEBA PARA DEVELOPMENT
-- =========================================

SELECT 
    '✅ Datos de ejemplo cargados exitosamente' as mensaje,
    'Usuarios de prueba disponibles:' as info;

SELECT 
    role as rol,
    email,
    'Contraseña: 123456' as credenciales
FROM users 
WHERE role IN ('admin', 'owner', 'tenant', 'security')
ORDER BY role, id;

COMMIT;