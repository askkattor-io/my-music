import Database from "better-sqlite3";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import type {
  CreatePlaylistSongType,
  CreatePlaylistType,
  GetAllSongsInPlaylistReturnType,
  GetAllSongsInPlaylistType,
  GetPlaylistByIdReturnType,
  GetPlaylistByIdType,
  GetPlaylistsByUserIdReturnType,
  GetPlaylistsByUserIdType,
} from "./types.js";

const SERVICE_DB_PATH = process.env["SERVICE_DB_PATH"];
if (!SERVICE_DB_PATH) throw new Error("Db path not provided");

mkdirSync(dirname(SERVICE_DB_PATH), { recursive: true });

const db = new Database(SERVICE_DB_PATH);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
CREATE TABLE IF NOT EXISTS playlists (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS playlist_songs (
    playlist_id TEXT NOT NULL,
    song_id TEXT NOT NULL,
    position INTEGER NOT NULL,
    added_at INTEGER NOT NULL,
    PRIMARY KEY (playlist_id, position),
    FOREIGN KEY (playlist_id) REFERENCES playlists(id) ON DELETE CASCADE
);
 
CREATE INDEX IF NOT EXISTS idx_playlists_user ON playlists(user_id);
CREATE INDEX IF NOT EXISTS idx_playlist_songs_song ON playlist_songs(song_id);

`);

const insertPlaylist = db.prepare<CreatePlaylistType>(
  `INSERT INTO playlists (id, user_id, name, created_at) VALUES (?, ?, ?, ?)`,
);

const insertPlaylistSong = db.prepare<CreatePlaylistSongType>(
  `INSERT INTO playlist_songs (playlist_id, song_id, position, added_at) VALUES (?, ?, ?, ?)`,
);

const getPlaylistsByUserId = db.prepare<
  GetPlaylistsByUserIdType,
  GetPlaylistsByUserIdReturnType
>(`SELECT id, name FROM playlists WHERE user_id = ?`);

const getPlaylistById = db.prepare<
  GetPlaylistByIdType,
  GetPlaylistByIdReturnType
>(`SELECT id, user_id, name, created_at FROM playlists WHERE id = ?`);

const getAllSongsInPlaylist = db.prepare<
  GetAllSongsInPlaylistType,
  GetAllSongsInPlaylistReturnType
>(
  `SELECT song_id, position FROM playlist_songs WHERE playlist_id = ? ORDER BY position`,
);

const removeSong = db.prepare(
  `DELETE FROM playlist_songs WHERE playlist_id = ? AND song_id = ?`,
);

const deletePlaylist = db.prepare(`DELETE FROM playlists WHERE id = ?`);

const getSongPosition = db.prepare<string, number>(`
  SELECT COALESCE(MAX(position), -1) + 1 FROM playlist_songs WHERE playlist_id = ?`);

export {
  db,
  insertPlaylist,
  getPlaylistById,
  getPlaylistsByUserId,
  insertPlaylistSong,
  getAllSongsInPlaylist,
  removeSong,
  deletePlaylist,
  getSongPosition,
};
