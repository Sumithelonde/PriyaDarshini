import fs from 'fs';
import path from 'path';
import initSqlJs from 'sql.js';
import { hashPassword, generateTotpSecret } from './auth.js';

const DB_DIR = path.resolve('server', 'data');
const DB_PATH = path.join(DB_DIR, 'auth.db');

if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

let db;

// Initialize SQL.js database
const initDb = async () => {
  const SQL = await initSqlJs();
  
  if (fs.existsSync(DB_PATH)) {
    const buffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }

  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      role TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      name TEXT,
      adminname TEXT,
      uid TEXT UNIQUE,
      email TEXT UNIQUE,
      password_hash TEXT,
      totp_secret TEXT,
      registration_number TEXT UNIQUE,
      enrollment_number TEXT UNIQUE,
      contact_number TEXT UNIQUE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      requester_id INTEGER NOT NULL,
      requester_role TEXT NOT NULL,
      target_id INTEGER NOT NULL,
      target_role TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Check if default admin exists
  const adminCheck = db.exec('SELECT id FROM users WHERE role = ? LIMIT 1', ['admin']);
  const adminExists = adminCheck.length > 0 && adminCheck[0].values.length > 0;

  if (!adminExists) {
    const passwordHash = await hashPassword('23016053');
    db.run(
      `INSERT INTO users (role, status, name, adminname, uid, email, password_hash, totp_secret)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      ['admin', 'verified', 'Default Admin', 'admin', '23016053', 'admin.legislate@gmail.com', passwordHash, null]
    );
    saveDb();
  }

  return db;
};

const saveDb = () => {
  if (db) {
    const data = db.export();
    fs.writeFileSync(DB_PATH, data);
  }
};

// Helper to convert sql.js result to object
const resultToObject = (result, index = 0) => {
  if (!result || result.length === 0 || result[0].values.length === 0) return null;
  const columns = result[0].columns;
  const values = result[0].values[index];
  const obj = {};
  columns.forEach((col, i) => {
    obj[col] = values[i];
  });
  return obj;
};

const resultToArray = (result) => {
  if (!result || result.length === 0) return [];
  const columns = result[0].columns;
  return result[0].values.map(values => {
    const obj = {};
    columns.forEach((col, i) => {
      obj[col] = values[i];
    });
    return obj;
  });
};

// Wait for db to initialize
let dbPromise = initDb();

export const getDb = () => dbPromise;

export const createUser = async (data) => {
  await dbPromise;
  db.run(
    `INSERT INTO users (role, status, name, adminname, uid, email, password_hash, totp_secret, registration_number, enrollment_number, contact_number)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [data.role, data.status, data.name, data.adminname, data.uid, data.email, data.password_hash, data.totp_secret, data.registration_number, data.enrollment_number, data.contact_number]
  );
  saveDb();
  const result = db.exec('SELECT * FROM users WHERE id = last_insert_rowid()');
  return resultToObject(result);
};

export const updateUserStatus = async (userId, status) => {
  await dbPromise;
  db.run('UPDATE users SET status = ? WHERE id = ?', [status, userId]);
  saveDb();
  const result = db.exec('SELECT * FROM users WHERE id = ?', [userId]);
  return resultToObject(result);
};

export const updateUserTotp = async (userId, totpSecret) => {
  await dbPromise;
  db.run('UPDATE users SET totp_secret = ? WHERE id = ?', [totpSecret, userId]);
  saveDb();
  const result = db.exec('SELECT * FROM users WHERE id = ?', [userId]);
  return resultToObject(result);
};

export const findUserByRoleIdentifier = async (role, identifier) => {
  await dbPromise;
  let result;
  if (role === 'admin') {
    result = db.exec('SELECT * FROM users WHERE role = ? AND adminname = ?', [role, identifier]);
  } else if (role === 'ngo') {
    result = db.exec('SELECT * FROM users WHERE role = ? AND registration_number = ?', [role, identifier]);
  } else if (role === 'lawyer') {
    result = db.exec('SELECT * FROM users WHERE role = ? AND contact_number = ?', [role, identifier]);
  } else {
    result = db.exec('SELECT * FROM users WHERE role = ? AND name = ?', [role, identifier]);
  }
  return resultToObject(result);
};

export const getUserById = async (id) => {
  await dbPromise;
  const result = db.exec('SELECT * FROM users WHERE id = ?', [id]);
  return resultToObject(result);
};

export const getUsersByRoleStatus = async (role, status) => {
  await dbPromise;
  const result = db.exec('SELECT * FROM users WHERE role = ? AND status = ? ORDER BY created_at DESC', [role, status]);
  return resultToArray(result);
};

export const getCounts = async () => {
  await dbPromise;
  const total = db.exec('SELECT COUNT(*) AS count FROM users');
  const verifiedNgo = db.exec('SELECT COUNT(*) AS count FROM users WHERE role = ? AND status = ?', ['ngo', 'verified']);
  const verifiedLawyer = db.exec('SELECT COUNT(*) AS count FROM users WHERE role = ? AND status = ?', ['lawyer', 'verified']);
  const individuals = db.exec('SELECT COUNT(*) AS count FROM users WHERE role = ?', ['individual']);

  return {
    totalUsers: total[0].values[0][0],
    verifiedNgos: verifiedNgo[0].values[0][0],
    verifiedLawyers: verifiedLawyer[0].values[0][0],
    individuals: individuals[0].values[0][0],
  };
};

export const createRequest = async ({ requesterId, requesterRole, targetId, targetRole }) => {
  await dbPromise;
  db.run(
    `INSERT INTO requests (requester_id, requester_role, target_id, target_role, status)
     VALUES (?, ?, ?, ?, ?)`,
    [requesterId, requesterRole, targetId, targetRole, 'pending']
  );
  saveDb();
  const result = db.exec('SELECT * FROM requests WHERE id = last_insert_rowid()');
  return resultToObject(result);
};

export const getRequestsForTarget = async (targetId, targetRole) => {
  await dbPromise;
  const result = db.exec(`
    SELECT r.*, 
           u.name AS requester_name, 
           u.contact_number AS requester_contact, 
           u.email AS requester_email,
           u.uid AS requester_uid,
           u.role AS requester_role
    FROM requests r
    JOIN users u ON u.id = r.requester_id
    WHERE r.target_id = ? AND r.target_role = ?
    ORDER BY r.created_at DESC
  `, [targetId, targetRole]);
  return resultToArray(result);
};

export const getRequestsForRequester = async (requesterId) => {
  await dbPromise;
  const result = db.exec(`
    SELECT r.*, u.name AS target_name, u.contact_number AS target_contact, u.email AS target_email
    FROM requests r
    JOIN users u ON u.id = r.target_id
    WHERE r.requester_id = ?
    ORDER BY r.created_at DESC
  `, [requesterId]);
  return resultToArray(result);
};

export const getVerifiedUsers = async (role) => {
  await dbPromise;
  const result = db.exec('SELECT id, name, email, contact_number, registration_number, enrollment_number FROM users WHERE role = ? AND status = ? ORDER BY created_at DESC', [role, 'verified']);
  return resultToArray(result);
};

export const updateRequestStatus = async (requestId, status) => {
  await dbPromise;
  db.run('UPDATE requests SET status = ? WHERE id = ?', [status, requestId]);
  saveDb();
  const result = db.exec('SELECT * FROM requests WHERE id = ?', [requestId]);
  return resultToObject(result);
};

export const getAcceptedConnections = async (userId, userRole) => {
  await dbPromise;
  const result = db.exec(`
    SELECT r.*, 
           u.name, 
           u.email, 
           u.contact_number, 
           u.role,
           u.uid,
           u.registration_number,
           u.enrollment_number
    FROM requests r
    JOIN users u ON (
      CASE 
        WHEN r.target_id = ? AND r.target_role = ? THEN u.id = r.requester_id
        WHEN r.requester_id = ? THEN u.id = r.target_id
      END
    )
    WHERE (r.target_id = ? AND r.target_role = ? OR r.requester_id = ?)
      AND r.status = 'accepted'
    ORDER BY r.created_at DESC
  `, [userId, userRole, userId, userId, userRole, userId]);
  return resultToArray(result);
};

export const ensureDefaultAdminTotp = async () => {
  await dbPromise;
  const result = db.exec('SELECT * FROM users WHERE role = ? AND adminname = ?', ['admin', 'admin']);
  const admin = resultToObject(result);
  if (!admin || admin.totp_secret) return null;

  const totp = await generateTotpSecret('Legislate AI Admin');
  await updateUserTotp(admin.id, totp.base32);
  return totp;
};
