import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import initSqlJs from 'sql.js';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { initialVehicles } from '../src/data/vehicles.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config({
    path: path.join(__dirname, '.env')
});
const dbPath = path.resolve(__dirname, process.env.DB_FILE || './data/drivex.sqlite');
fs.mkdirSync(path.dirname(dbPath), { recursive: true });
const SQL = await initSqlJs();
const db = fs.existsSync(dbPath) ? new SQL.Database(new Uint8Array(fs.readFileSync(dbPath))) : new SQL.Database();
const persist = () => fs.writeFileSync(dbPath, Buffer.from(db.export()));
const run = (sql, params = []) => db.run(sql, params);
const rows = (sql, params = []) => { const s = db.prepare(sql); s.bind(params); const out=[]; while(s.step()) out.push(s.getAsObject()); s.free(); return out; };
const one = (sql, params = []) => rows(sql, params)[0] || null;

db.run(`CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, email TEXT NOT NULL UNIQUE, phone TEXT NOT NULL DEFAULT '', password_hash TEXT NOT NULL, role TEXT NOT NULL DEFAULT 'customer', created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS vehicles (id TEXT PRIMARY KEY, name TEXT NOT NULL, brand TEXT NOT NULL, category TEXT, pricePerDay REAL NOT NULL, seats INTEGER, transmission TEXT, fuel TEXT, year INTEGER, rating REAL, location TEXT, image TEXT, description TEXT, features TEXT);
CREATE TABLE IF NOT EXISTS bookings (id TEXT PRIMARY KEY, user_id INTEGER NOT NULL, vehicle_id TEXT NOT NULL, vehicle_name TEXT NOT NULL, name TEXT NOT NULL, email TEXT NOT NULL, phone TEXT NOT NULL, pickup_date TEXT NOT NULL, return_date TEXT NOT NULL, days INTEGER NOT NULL, price_per_day REAL NOT NULL, total REAL NOT NULL, notes TEXT, status TEXT NOT NULL DEFAULT 'Pending', created_at TEXT NOT NULL, FOREIGN KEY(user_id) REFERENCES users(id), FOREIGN KEY(vehicle_id) REFERENCES vehicles(id));`);
if (!one('SELECT id FROM vehicles LIMIT 1')) { for (const v of initialVehicles) run('INSERT INTO vehicles VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)',[v.id,v.name,v.brand,v.category,v.pricePerDay,v.seats,v.transmission,v.fuel,v.year,v.rating,v.location,v.image,v.description,JSON.stringify(v.features||[])]); persist(); }
// Admin credentials and JWT signing secret must be configured privately in server/.env.
const adminEmail = String(process.env.ADMIN_EMAIL || '').trim().toLowerCase();
const adminPassword = String(process.env.ADMIN_PASSWORD || '');
const jwtSecret = String(process.env.JWT_SECRET || '');
if (!adminEmail || !/^\S+@\S+\.\S+$/.test(adminEmail)) throw new Error('Set a valid ADMIN_EMAIL in server/.env before starting DriveX.');
if (adminPassword.length < 12) throw new Error('Set a unique ADMIN_PASSWORD of at least 12 characters in server/.env.');
if (jwtSecret.length < 32 || jwtSecret.toLowerCase().includes('replace')) throw new Error('Set a private random JWT_SECRET of at least 32 characters in server/.env.');
const adminHash = bcrypt.hashSync(adminPassword, 12);
const configuredAdmin = one('SELECT id FROM users WHERE email=?', [adminEmail]);
const legacyAdmin = one('SELECT id FROM users WHERE email=? AND role=\'admin\'', ['admin@drivex.local']);
if (configuredAdmin) {
  run('UPDATE users SET password_hash=?, role=\'admin\' WHERE id=?', [adminHash, configuredAdmin.id]);
} else if (legacyAdmin) {
  // Migrate the previous demo administrator so its publicly documented credentials stop working.
  run('UPDATE users SET name=?, email=?, password_hash=?, role=\'admin\' WHERE id=?', ['DriveX Administrator', adminEmail, adminHash, legacyAdmin.id]);
} else {
  run('INSERT INTO users(name,email,phone,password_hash,role) VALUES(?,?,?,?,?)', ['DriveX Administrator', adminEmail, '', adminHash, 'admin']);
}
persist();
const app = express(); app.use(cors({ origin: process.env.CLIENT_ORIGIN?.split(',') || true })); app.use(express.json({limit:'1mb'}));
const tokenFor = u => jwt.sign({ id:u.id, role:u.role, email:u.email }, jwtSecret, { expiresIn:'12h' });
function auth(req,res,next){ const raw=req.headers.authorization||''; try { const token=raw.startsWith('Bearer ')?raw.slice(7):''; req.user=jwt.verify(token,jwtSecret); next(); } catch { res.status(401).json({error:'Please sign in to continue.'}); } }
const admin=(req,res,next)=>req.user?.role==='admin'?next():res.status(403).json({error:'Administrator access required.'});
const vehicleOut=v=>({...v,pricePerDay:Number(v.pricePerDay),seats:Number(v.seats),year:Number(v.year),rating:Number(v.rating),features:JSON.parse(v.features||'[]')});
app.get('/api/health',(req,res)=>res.json({status:'ok'}));
app.post('/api/auth/register', (req,res)=>{ const {name,email,phone,password}=req.body||{}; if(!name?.trim()||!/^\S+@\S+\.\S+$/.test(email||'')||!phone?.trim()||typeof password!=='string'||password.length<8) return res.status(400).json({error:'Enter your name, valid email, phone and a password of at least 8 characters.'}); try { const hash=bcrypt.hashSync(password,12); run('INSERT INTO users(name,email,phone,password_hash,role) VALUES(?,?,?,?,?)',[name.trim(),email.trim().toLowerCase(),phone.trim(),hash,'customer']); persist(); const user=one('SELECT id,name,email,phone,role FROM users WHERE email=?',[email.trim().toLowerCase()]); res.status(201).json({token:tokenFor(user),user}); } catch { res.status(409).json({error:'An account with this email already exists.'}); } });
app.post('/api/auth/login',(req,res)=>{const email=String(req.body?.email||'').trim().toLowerCase(), password=String(req.body?.password||''); const u=one('SELECT * FROM users WHERE email=?',[email]); if(!u||!bcrypt.compareSync(password,u.password_hash)) return res.status(401).json({error:'Invalid email or password.'}); const user={id:u.id,name:u.name,email:u.email,phone:u.phone,role:u.role}; res.json({token:tokenFor(user),user});});
app.get('/api/auth/me',auth,(req,res)=>{const user=one('SELECT id,name,email,phone,role FROM users WHERE id=?',[req.user.id]); if(!user)return res.status(401).json({error:'Account not found.'}); res.json({user});});
app.get('/api/vehicles',(req,res)=>res.json(rows('SELECT * FROM vehicles ORDER BY name').map(vehicleOut)));
app.post('/api/vehicles',auth,admin,(req,res)=>{const v=req.body||{}; if(!v.name||!v.brand||!(Number(v.pricePerDay)>0))return res.status(400).json({error:'Vehicle name, brand and a positive daily price are required.'}); const id=v.id||`dx-${Date.now()}`; run('INSERT INTO vehicles VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)',[id,v.name,v.brand,v.category||'Sedan',Number(v.pricePerDay),Number(v.seats)||5,v.transmission||'Automatic',v.fuel||'Petrol',Number(v.year)||new Date().getFullYear(),Number(v.rating)||4.7,v.location||'Mumbai',v.image||'',v.description||'',JSON.stringify(v.features||[])]); persist(); res.status(201).json(vehicleOut(one('SELECT * FROM vehicles WHERE id=?',[id])));});
app.put('/api/vehicles/:id',auth,admin,(req,res)=>{const v=req.body||{}; if(!one('SELECT id FROM vehicles WHERE id=?',[req.params.id]))return res.status(404).json({error:'Vehicle not found.'}); run('UPDATE vehicles SET name=?,brand=?,category=?,pricePerDay=?,seats=?,transmission=?,fuel=?,year=?,rating=?,location=?,image=?,description=?,features=? WHERE id=?',[v.name,v.brand,v.category,Number(v.pricePerDay),Number(v.seats)||5,v.transmission,v.fuel,Number(v.year),Number(v.rating)||4.7,v.location,v.image,v.description,JSON.stringify(v.features||[]),req.params.id]); persist(); res.json(vehicleOut(one('SELECT * FROM vehicles WHERE id=?',[req.params.id])));});
app.delete('/api/vehicles/:id',auth,admin,(req,res)=>{if(one("SELECT id FROM bookings WHERE vehicle_id=? AND status IN ('Pending','Approved')",[req.params.id]))return res.status(409).json({error:'This vehicle has active bookings and cannot be deleted.'}); run('DELETE FROM vehicles WHERE id=?',[req.params.id]); persist(); res.json({ok:true});});
app.get('/api/bookings',auth,(req,res)=>{const data=req.user.role==='admin'?rows('SELECT * FROM bookings ORDER BY created_at DESC'):rows('SELECT * FROM bookings WHERE user_id=? ORDER BY created_at DESC',[req.user.id]); res.json(data.map(b=>({id:b.id,vehicleId:b.vehicle_id,vehicleName:b.vehicle_name,name:b.name,email:b.email,phone:b.phone,pickupDate:b.pickup_date,returnDate:b.return_date,days:Number(b.days),pricePerDay:Number(b.price_per_day),total:Number(b.total),notes:b.notes,status:b.status,createdAt:b.created_at})));});
app.post('/api/bookings',auth,(req,res)=>{const b=req.body||{}; const v=one('SELECT * FROM vehicles WHERE id=?',[b.vehicleId]); if(!v)return res.status(404).json({error:'Vehicle not found.'}); if(!b.phone?.trim()||!/^\d{4}-\d{2}-\d{2}$/.test(b.pickupDate||'')||!/^\d{4}-\d{2}-\d{2}$/.test(b.returnDate||'')||!Number.isFinite(Date.parse(b.pickupDate+'T00:00:00Z'))||!Number.isFinite(Date.parse(b.returnDate+'T00:00:00Z'))||b.returnDate<=b.pickupDate)return res.status(400).json({error:'Please provide valid contact details and rental dates.'}); if(b.pickupDate<new Date().toISOString().slice(0,10))return res.status(400).json({error:'Pickup date cannot be in the past.'}); const conflict=one("SELECT id FROM bookings WHERE vehicle_id=? AND status IN ('Pending','Approved') AND pickup_date < ? AND return_date > ? LIMIT 1",[v.id,b.returnDate,b.pickupDate]); if(conflict)return res.status(409).json({error:'This vehicle is already reserved for part of those dates. Please choose different dates.'}); const days=Math.round((Date.parse(b.returnDate+'T00:00:00Z')-Date.parse(b.pickupDate+'T00:00:00Z'))/86400000); const id=`DX-${Date.now().toString(36).toUpperCase()}`; const user=one('SELECT * FROM users WHERE id=?',[req.user.id]); const total=days*Number(v.pricePerDay); run('INSERT INTO bookings VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',[id,user.id,v.id,v.name,user.name,user.email,b.phone.trim(),b.pickupDate,b.returnDate,days,Number(v.pricePerDay),total,String(b.notes||''), 'Pending',new Date().toISOString()]); persist(); res.status(201).json({id,vehicleId:v.id,vehicleName:v.name,name:user.name,email:user.email,phone:b.phone,pickupDate:b.pickupDate,returnDate:b.returnDate,days,pricePerDay:Number(v.pricePerDay),total,notes:b.notes||'',status:'Pending',createdAt:new Date().toISOString()});});
app.patch('/api/bookings/:id/status',auth,admin,(req,res)=>{const allowed=['Approved','Rejected','Cancelled','Completed']; if(!allowed.includes(req.body?.status))return res.status(400).json({error:'Invalid booking status.'}); if(!one('SELECT id FROM bookings WHERE id=?',[req.params.id]))return res.status(404).json({error:'Booking not found.'}); run('UPDATE bookings SET status=? WHERE id=?',[req.body.status,req.params.id]); persist(); res.json({ok:true,status:req.body.status});});
app.patch('/api/bookings/:id/cancel',auth,(req,res)=>{const b=one('SELECT * FROM bookings WHERE id=? AND user_id=?',[req.params.id,req.user.id]); if(!b)return res.status(404).json({error:'Booking not found.'}); if(b.status!=='Pending')return res.status(409).json({error:'Only pending bookings can be cancelled.'}); run("UPDATE bookings SET status='Cancelled' WHERE id=?",[req.params.id]); persist(); res.json({ok:true,status:'Cancelled'});});
const port=Number(process.env.PORT||5000); app.listen(port,()=>console.log(`DriveX API running at http://localhost:${port}`));
