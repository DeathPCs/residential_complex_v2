// Servicio de acceso a datos con Prisma
const prisma = require('./prismaClient');

module.exports = {
  // Usuarios
  getUsers: ({ skip = 0, take = 10, where = {}, select = undefined } = {}) =>
    prisma.user.findMany({ skip, take, where, select }),
  countUsers: (where = {}) => prisma.user.count({ where }),
  getUserById: (id) => prisma.user.findUnique({ where: { id: String(id) } }),
  createUser: (data) => prisma.user.create({ data }),
  updateUser: (id, data) => prisma.user.update({ where: { id: String(id) }, data }),
  deleteUser: (id) => prisma.user.delete({ where: { id: String(id) } }),

  // Apartamentos
  getApartments: (options = {}) => prisma.apartment.findMany(options),
  getApartmentById: (id) => prisma.apartment.findUnique({ where: { id: String(id) }, include: { owner: true } }),
  createApartment: (data) => prisma.apartment.create({ data }),
  updateApartment: (id, data) => prisma.apartment.update({ where: { id: String(id) }, data }),
  deleteApartment: (id) => prisma.apartment.delete({ where: { id: String(id) } }),

  // AirbnbGuest
  getAirbnbGuests: (options = {}) => prisma.airbnbGuest.findMany(options),
  getAirbnbGuestById: (id) => prisma.airbnbGuest.findUnique({ where: { id: String(id) } }),
  createAirbnbGuest: (data) => prisma.airbnbGuest.create({ data }),
  updateAirbnbGuest: (id, data) => prisma.airbnbGuest.update({ where: { id: String(id) }, data }),
  deleteAirbnbGuest: (id) => prisma.airbnbGuest.delete({ where: { id: String(id) } }),

  // DamageReport
  getDamageReports: (options = {}) => prisma.damageReport.findMany(options),
  countDamageReports: (where = {}) => prisma.damageReport.count({ where }),
  getDamageReportById: (id) => prisma.damageReport.findUnique({ where: { id: String(id) } }),
  createDamageReport: (data) => prisma.damageReport.create({ data }),
  updateDamageReport: (id, data) => prisma.damageReport.update({ where: { id: String(id) }, data }),
  deleteDamageReport: (id) => prisma.damageReport.delete({ where: { id: String(id) } }),

  // Maintenance
  getMaintenances: (options = {}) => prisma.maintenance.findMany(options),
  countMaintenances: (where = {}) => prisma.maintenance.count({ where }),
  getMaintenanceById: (id) => prisma.maintenance.findUnique({ where: { id: String(id) } }),
  createMaintenance: (data) => prisma.maintenance.create({ data }),
  updateMaintenance: (id, data) => prisma.maintenance.update({ where: { id: String(id) }, data }),
  deleteMaintenance: (id) => prisma.maintenance.delete({ where: { id: String(id) } }),

  // Notification
  getNotifications: (options = {}) => prisma.notification.findMany(options),
  getNotificationById: (id) => prisma.notification.findUnique({ where: { id: String(id) } }),
  createNotification: (data) => prisma.notification.create({ data }),
  updateNotification: (id, data) => prisma.notification.update({ where: { id: String(id) }, data }),
  deleteNotification: (id) => prisma.notification.delete({ where: { id: String(id) } }),

  // Payment
  getPayments: (options = {}) => prisma.payment.findMany(options),
  countPayments: (where = {}) => prisma.payment.count({ where }),
  getPaymentById: (id) => prisma.payment.findUnique({ where: { id: String(id) }, include: { user: true, apartment: true } }),
  createPayment: (data) => prisma.payment.create({ data }),
  updatePayment: (id, data) => prisma.payment.update({ where: { id: String(id) }, data }),
  deletePayment: (id) => prisma.payment.delete({ where: { id: String(id) } })
};
