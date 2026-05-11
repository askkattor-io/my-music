import Database from "better-sqlite3";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";

const SERVICE_DB_PATH = process.env["SERVICE_DB_PATH"];
if (!SERVICE_DB_PATH) throw new Error("Db path not provided");

mkdirSync(dirname(SERVICE_DB_PATH), { recursive: true });

const db = new Database(SERVICE_DB_PATH);
db.pragma("journal_mode = WAL");

db.exec(`
CREATE TABLE IF NOT EXISTS play_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    song_id TEXT NOT NULL,
    played_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_play_history_user ON play_history(user_id, played_at DESC);
`);

const insertPlayEvent = db.prepare<[string, string, number]>(
  `INSERT INTO play_history (user_id, song_id, played_at) VALUES (?, ?, ?)`,
);

const getPlayHistoryByUser = db.prepare<
  [string],
  { id: number; song_id: string; played_at: number }
>(
  `SELECT id, song_id, played_at FROM play_history WHERE user_id = ? ORDER BY played_at DESC LIMIT 50`,
);

export { db, insertPlayEvent, getPlayHistoryByUser };
