// Script de inicio rápido para producción
const prisma = require('../src/infrastructure/database/prismaClient');
const bcrypt = require('bcrypt');

async function setupProduction() {
    try {
        console.log('🚀 Configurando sistema para producción...\n');

        // Limpiar base de datos (solo en primera ejecución)
        console.log('📋 Limpiando base de datos...');
        await prisma.payment.deleteMany();
        await prisma.notification.deleteMany();
        await prisma.damageReport.deleteMany();
        await prisma.maintenance.deleteMany();
        await prisma.airbnbGuest.deleteMany();
        await prisma.apartment.deleteMany();
        await prisma.user.deleteMany();
        console.log('✅ Base de datos limpiada\n');

        // Crear usuario administrador
        console.log('👤 Creando usuario administrador...');
        const adminPassword = await bcrypt.hash('Admin123', 12);
        const admin = await prisma.user.create({
            data: {
                name: 'Administrador',
                email: 'admin@residential.com',
                cedula: '10000000',
                phone: '3001234567',
                role: 'admin',
                password: adminPassword,
                status: 'active'
            }
        });
        console.log(`✅ Admin creado: ${admin.email}\n`);

        // Crear usuario owner
        console.log('🏠 Creando usuario propietario...');
        const ownerPassword = await bcrypt.hash('Owner123', 12);
        const owner = await prisma.user.create({
            data: {
                name: 'Juan Propietario',
                email: 'owner@residential.com',
                cedula: '20000000',
                phone: '3007654321',
                role: 'owner',
                password: ownerPassword,
                status: 'active'
            }
        });
        console.log(`✅ Owner creado: ${owner.email}\n`);

        // Crear apartamento de ejemplo
        console.log('🏢 Creando apartamento de ejemplo...');
        const apartment = await prisma.apartment.create({
            data: {
                number: '101',
                tower: 'A',
                floor: 1,
                ownerId: owner.id,
                status: 'occupied',
                type: 'residential'
            }
        });
        console.log(`✅ Apartamento creado: ${apartment.number}\n`);

        // Crear mantenimiento de ejemplo
        console.log('🔧 Creando mantenimiento de ejemplo...');
        const maintenance = await prisma.maintenance.create({
            data: {
                title: 'Limpieza de piscina',
                description: 'Mantenimiento mensual de la piscina',
                area: 'Zonas comunes',
                status: 'pending',
                scheduledDate: new Date(Date.now() + 86400000 * 3)
            }
        });
        console.log(`✅ Mantenimiento creado: ${maintenance.title}\n`);

        console.log('✨ Sistema configurado correctamente para producción!\n');
        console.log('📝 Credenciales:');
        console.log('   Admin: admin@residential.com / Admin123');
        console.log('   Owner: owner@residential.com / Owner123\n');

        await prisma.$disconnect();
    } catch (error) {
        console.error('❌ Error durante la configuración:', error);
        await prisma.$disconnect();
        process.exit(1);
    }
}

setupProduction();
