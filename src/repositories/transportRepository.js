const db = require('../config/database');

const all = async (sql, params = []) => { const [rows] = await db.execute(sql, params); return rows; };
const run = async (sql, params = []) => { const [result] = await db.execute(sql, params); return result; };

module.exports = {
  dashboard: async () => {
    const [[routes]] = await db.query("SELECT COUNT(*) AS total FROM Routes WHERE is_active=1");
    const [[vehicles]] = await db.query("SELECT COUNT(*) AS total, SUM(status='ACTIVE') AS active FROM Vehicles");
    const [[reservations]] = await db.query("SELECT COUNT(*) AS total, SUM(status='PENDING') AS pending FROM Reservations");
    const [[sales]] = await db.query('SELECT COALESCE(SUM(amount),0) AS total FROM Sales WHERE DATE(date)=CURDATE()');
    const latest = await all(`SELECT rs.id, r.origin, r.destination, rs.date, rs.time, v.plate_number,
      v.capacity, COALESCE(SUM(CASE WHEN re.status <> 'CANCELED' THEN re.seat_count ELSE 0 END),0) AS occupied
      FROM RouteSchedules rs JOIN Routes r ON r.id=rs.route_id JOIN Vehicles v ON v.id=rs.vehicle_id
      LEFT JOIN Reservations re ON re.route_schedule_id=rs.id
      WHERE rs.date >= CURDATE() GROUP BY rs.id ORDER BY rs.date, rs.time LIMIT 6`);
    return { routes: Number(routes.total || 0), vehicles: Number(vehicles.total || 0), activeVehicles: Number(vehicles.active || 0), reservations: Number(reservations.total || 0), pending: Number(reservations.pending || 0), salesToday: Number(sales.total || 0), departures: latest };
  },
  listRoutes: () => all('SELECT * FROM Routes ORDER BY origin,destination'),
  createRoute: (d) => run('INSERT INTO Routes (origin,destination,distance_km,estimated_duration,is_active,price) VALUES (?,?,?,?,?,?)', [d.origin,d.destination,d.distance_km,d.estimated_duration,d.is_active ?? 1,d.price]),
  updateRoute: (id,d) => run('UPDATE Routes SET origin=?,destination=?,distance_km=?,estimated_duration=?,is_active=?,price=? WHERE id=?', [d.origin,d.destination,d.distance_km,d.estimated_duration,d.is_active,d.price,id]),
  deleteRoute: (id) => run('DELETE FROM Routes WHERE id=?', [id]),
  listVehicles: () => all('SELECT * FROM Vehicles ORDER BY created_at DESC'),
  createVehicle: (d) => run('INSERT INTO Vehicles (plate_number,brand,model,year,capacity,status) VALUES (?,?,?,?,?,?)', [d.plate_number,d.brand,d.model,d.year,d.capacity,d.status || 'ACTIVE']),
  updateVehicle: (id,d) => run('UPDATE Vehicles SET plate_number=?,brand=?,model=?,year=?,capacity=?,status=? WHERE id=?', [d.plate_number,d.brand,d.model,d.year,d.capacity,d.status,id]),
  deleteVehicle: (id) => run('DELETE FROM Vehicles WHERE id=?', [id]),
  schedules: async (filters = {}) => all(`SELECT rs.id,rs.route_id,rs.date,rs.time,rs.vehicle_id,r.origin,r.destination,r.price,r.estimated_duration,v.plate_number,v.capacity,
      COALESCE(SUM(CASE WHEN re.status <> 'CANCELED' THEN re.seat_count ELSE 0 END),0) AS occupied
      FROM RouteSchedules rs JOIN Routes r ON r.id=rs.route_id JOIN Vehicles v ON v.id=rs.vehicle_id
      LEFT JOIN Reservations re ON re.route_schedule_id=rs.id
      WHERE r.is_active=1 AND rs.date>=CURDATE() AND (?='' OR r.origin LIKE CONCAT('%',?,'%')) AND (?='' OR r.destination LIKE CONCAT('%',?,'%'))
      AND (?='' OR rs.date=?) GROUP BY rs.id ORDER BY rs.date,rs.time`, [filters.origin||'',filters.origin||'',filters.destination||'',filters.destination||'',filters.date||'',filters.date||'']),
  createSchedule: (d) => run('INSERT INTO RouteSchedules (route_id,date,time,vehicle_id) VALUES (?,?,?,?)', [d.route_id,d.date,d.time,d.vehicle_id]),
  listReservations: () => all(`SELECT re.id,re.seat_count,re.status, re.route_schedule_id, rs.date,rs.time,r.origin,r.destination,r.price,
      CONCAT(u.first_name,' ',u.last_name) AS client, u.phone_number
      FROM Reservations re JOIN Clients c ON c.id=re.client_id JOIN Users u ON u.id=c.user_id
      JOIN RouteSchedules rs ON rs.id=re.route_schedule_id JOIN Routes r ON r.id=rs.route_id ORDER BY rs.date DESC,re.id DESC`),
  setReservationStatus: (id,status) => run('UPDATE Reservations SET status=? WHERE id=?', [status,id]),
  createReservation: async (d) => {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();
      const [scheduleRows] = await connection.execute(`SELECT v.capacity,r.price FROM RouteSchedules rs
        JOIN Vehicles v ON v.id=rs.vehicle_id JOIN Routes r ON r.id=rs.route_id WHERE rs.id=? AND r.is_active=1 AND rs.date>=CURDATE() FOR UPDATE`, [d.route_schedule_id]);
      if (!scheduleRows.length) { const e = new Error('La salida ya no está disponible'); e.status=404; throw e; }
      const [occupiedRows] = await connection.execute("SELECT COALESCE(SUM(seat_count),0) AS occupied FROM Reservations WHERE route_schedule_id=? AND status <> 'CANCELED'", [d.route_schedule_id]);
      if (Number(occupiedRows[0].occupied)+Number(d.seat_count)>Number(scheduleRows[0].capacity)) { const e = new Error('No hay suficientes puestos disponibles'); e.status=409; throw e; }
      const [users] = await connection.execute('SELECT id,document_number FROM Users WHERE email=? FOR UPDATE', [d.email]);
      let userId;
      if (users.length) {
        if (users[0].document_number !== d.document_number) { const e = new Error('Verifica el correo y documento del titular'); e.status=409; throw e; }
        userId=users[0].id;
      } else {
        const crypto = require('crypto');
        const salt=crypto.randomBytes(16).toString('hex');
        const hash=crypto.scryptSync(crypto.randomBytes(48).toString('hex'),salt,64).toString('hex');
        const [user] = await connection.execute(`INSERT INTO Users (email,password,first_name,last_name,phone_number,document_type,document_number)
          VALUES (?,?,?,?,?,?,?)`, [d.email,`${salt}:${hash}`,d.first_name,d.last_name,d.phone_number||null,d.document_type,d.document_number]);
        userId=user.insertId;
      }
      const [clients] = await connection.execute('SELECT id FROM Clients WHERE user_id=?', [userId]);
      let clientId;
      if (clients.length) clientId=clients[0].id;
      else { const [client]=await connection.execute("INSERT INTO Clients (user_id,user_type) VALUES (?,'PASSENGER')",[userId]); clientId=client.insertId; }
      const [reservation]=await connection.execute("INSERT INTO Reservations (client_id,route_schedule_id,seat_count,status) VALUES (?,?,?,'PENDING')", [clientId,d.route_schedule_id,d.seat_count]);
      const passengers=d.passengers?.length?d.passengers:[{first_name:d.first_name,last_name:d.last_name,document_type:d.document_type,document_number:d.document_number,is_client:true}];
      if (passengers.length !== Number(d.seat_count)) { const e = new Error('Registra los datos de cada pasajero para todos los puestos'); e.status=400; throw e; }
      for (const passenger of passengers) await connection.execute(`INSERT INTO ReservationPassengers (reservation_id,first_name,last_name,document_type,document_number,is_client)
        VALUES (?,?,?,?,?,?)`, [reservation.insertId,passenger.first_name,passenger.last_name,passenger.document_type,passenger.document_number,passenger.is_client?1:0]);
      await connection.commit();
      return { insertId:reservation.insertId,amount:Number(scheduleRows[0].price)*Number(d.seat_count),status:'PENDING' };
    } catch (error) { await connection.rollback(); throw error; }
    finally { connection.release(); }
  },
  listSales: () => all(`SELECT s.id,s.amount,s.date,re.id AS reservation_id, re.status,r.origin,r.destination
      FROM Sales s JOIN Reservations re ON re.id=s.reservation_id JOIN RouteSchedules rs ON rs.id=re.route_schedule_id JOIN Routes r ON r.id=rs.route_id ORDER BY s.date DESC LIMIT 100`),
};
