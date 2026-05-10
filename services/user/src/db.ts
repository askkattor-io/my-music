import Database from "better-sqlite3";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";

const SERVICE_DB_PATH = process.env["SERVICE_DB_PATH"];
if (!SERVICE_DB_PATH) throw new Error("Db path not provided");

mkdirSync(dirname(SERVICE_DB_PATH), { recursive: true });

const db = new Database(SERVICE_DB_PATH);
db.pragma("journal_mode = WAL");

db.exec(`
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
`);

const insertUser = db.prepare(
  `INSERT INTO users (id, email, password_hash, created_at) VALUES (?, ?, ?, ?)`,
);

const findUserByEmail = db.prepare(
  `SELECT id, email, password_hash FROM users WHERE email = ?`,
);

export { db, insertUser, findUserByEmail };
