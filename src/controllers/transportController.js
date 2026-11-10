const service = require('../services/transportService');
const wrap = (fn) => async (req,res,next) => { try { res.json({ data: await fn(req) }); } catch (error) { next(error); } };
const created = (fn) => async (req,res,next) => { try { const result=await fn(req); res.status(result.insertId?201:200).json({ data: { id: result.insertId || req.params.id, affectedRows: result.affectedRows, ...(result.amount!==undefined?{amount:result.amount,status:result.status}: {}) } }); } catch (error) { next(error); } };

module.exports = {
  dashboard: wrap(() => service.dashboard()), routes: wrap(() => service.routes()), vehicles: wrap(() => service.vehicles()),
  schedules: wrap((req) => service.schedules(req.query)), reservations: wrap(() => service.reservations()), sales: wrap(() => service.sales()),
  createRoute: created((req) => service.createRoute(req.body)), updateRoute: created((req) => service.updateRoute(req.params.id,req.body)), deleteRoute: created((req) => service.deleteRoute(req.params.id)),
  createVehicle: created((req) => service.createVehicle(req.body)), updateVehicle: created((req) => service.updateVehicle(req.params.id,req.body)), deleteVehicle: created((req) => service.deleteVehicle(req.params.id)),
  createSchedule: created((req) => service.createSchedule(req.body)), setReservationStatus: created((req) => service.setReservationStatus(req.params.id,req.body.status)),
  createReservation: created((req) => service.createReservation(req.body)),
};
