const repo = require('../repositories/transportRepository');

const required = (data, fields) => {
  const missing = fields.filter((key) => data[key] === undefined || data[key] === null || data[key] === '');
  if (missing.length) { const error = new Error(`Campos obligatorios: ${missing.join(', ')}`); error.status = 400; throw error; }
};
const positive = (data, fields) => {
  for (const key of fields) if (!Number.isFinite(Number(data[key])) || Number(data[key]) <= 0) { const error = new Error(`${key} debe ser un número mayor que cero`); error.status = 400; throw error; }
};

module.exports = {
  dashboard: () => repo.dashboard(), routes: () => repo.listRoutes(), vehicles: () => repo.listVehicles(),
  schedules: (filters) => repo.schedules(filters), reservations: () => repo.listReservations(), sales: () => repo.listSales(),
  createRoute: (d) => { required(d,['origin','destination','distance_km','estimated_duration','price']); positive(d,['distance_km','estimated_duration','price']); return repo.createRoute(d); },
  updateRoute: (id,d) => { required(d,['origin','destination','distance_km','estimated_duration','price','is_active']); positive(d,['distance_km','estimated_duration','price']); return repo.updateRoute(id,d); },
  deleteRoute: (id) => repo.deleteRoute(id),
  createVehicle: (d) => { required(d,['plate_number','brand','model','year','capacity']); positive(d,['year','capacity']); return repo.createVehicle(d); },
  updateVehicle: (id,d) => { required(d,['plate_number','brand','model','year','capacity','status']); positive(d,['year','capacity']); return repo.updateVehicle(id,d); },
  deleteVehicle: (id) => repo.deleteVehicle(id),
  createSchedule: (d) => { required(d,['route_id','date','time','vehicle_id']); positive(d,['route_id','vehicle_id']); return repo.createSchedule(d); },
  setReservationStatus: (id,status) => { if (!['PENDING','CONFIRMED','CANCELED'].includes(status)) { const e = new Error('Estado de reserva no válido'); e.status=400; throw e; } return repo.setReservationStatus(id,status); },
  createReservation: (d) => {
    required(d,['route_schedule_id','seat_count','email','first_name','last_name','document_type','document_number']);
    positive(d,['route_schedule_id','seat_count']);
    if (!Number.isInteger(Number(d.route_schedule_id)) || !Number.isInteger(Number(d.seat_count))) { const e=new Error('La ruta y la cantidad de pasajeros deben ser números enteros'); e.status=400; throw e; }
    if (!/^\S+@\S+\.\S+$/.test(d.email)) { const e=new Error('Ingresa un correo electrónico válido'); e.status=400; throw e; }
    if (!Array.isArray(d.passengers)) { const e=new Error('Agrega los datos de los pasajeros'); e.status=400; throw e; }
    for (const p of d.passengers) required(p,['first_name','last_name','document_type','document_number']);
    return repo.createReservation(d);
  },
};
