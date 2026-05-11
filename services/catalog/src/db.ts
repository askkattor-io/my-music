import Database from "better-sqlite3";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";

const SERVICE_DB_PATH = process.env["SERVICE_DB_PATH"];
if (!SERVICE_DB_PATH) throw new Error("Db path not provided");

mkdirSync(dirname(SERVICE_DB_PATH), { recursive: true });

const db = new Database(SERVICE_DB_PATH);
db.pragma("journal_mode = WAL");

db.exec(`
CREATE TABLE IF NOT EXISTS songs (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    artist TEXT NOT NULL,
    duration INTEGER NOT NULL,
    created_at INTEGER NOT NULL
);
`);

const insertSong = db.prepare<[string, string, string, number, number]>(
  `INSERT INTO songs (id, title, artist, duration, created_at) VALUES (?, ?, ?, ?, ?)`,
);

const getSongById = db.prepare<
  [string],
  { id: string; title: string; artist: string; duration: number; created_at: number }
>(`SELECT id, title, artist, duration, created_at FROM songs WHERE id = ?`);

const getAllSongs = db.prepare<
  [],
  { id: string; title: string; artist: string; duration: number }
>(`SELECT id, title, artist, duration FROM songs ORDER BY created_at DESC`);

export { db, insertSong, getSongById, getAllSongs };
