import { registerAndStart } from "@my-music/service-registry";
import Fastify from "fastify";
import {
  deletePlaylist,
  getAllSongsInPlaylist,
  getPlaylistById,
  getPlaylistsByUserId,
  getSongPosition,
  insertPlaylist,
  insertPlaylistSong,
  removeSong,
} from "./db.js";
import authPlugin from "@my-music/auth";

import { nanoid } from "nanoid";
import { AddSongSchema, CreatePlaylistSchema } from "./types.js";

const name = process.env["SERVICE_NAME"];
const address = process.env["SERVICE_ADDRESS"];
const port = process.env["SERVICE_PORT"];
const secret = process.env["JWT_SECRET"];

if (!name || !address || !port || !secret) {
  throw new Error("Missing env variables, please provide");
}

const server = Fastify({ logger: true });

await server.register(authPlugin, { secret });

server.get("/health", (req, res) => {
  res.send(true);
});

server.get("/api/playlist", { onRequest: [server.requireAuth] }, (req, res) => {
  try {
    const playlists = getPlaylistsByUserId.all(req.user!.id);
    return playlists;
  } catch (error) {
    return { error: "Invalid request" };
  }
});

server.post(
  "/api/playlist",
  { onRequest: [server.requireAuth] },
  (req, res) => {
    try {
      const body = CreatePlaylistSchema.parse(req.body);
      const id = nanoid();
      const now = Date.now();
      insertPlaylist.run(id, req.user!.id, body.name, now);
      return { id };
    } catch (error) {
      res.code(400);
      return { error: "Invalid request" };
    }
  },
);

server.get(
  "/api/playlist/:id",
  { onRequest: [server.requireAuth] },
  (req, res) => {
    const { id } = req.params as { id: string };
    const playlist = getPlaylistById.get(id);
    if (!playlist) {
      res.code(404);
      return { error: "Playlist not found" };
    }
    if (playlist.user_id !== req.user!.id) {
      res.code(403);
      return { error: "Forbidden" };
    }
    const songs = getAllSongsInPlaylist.all(id);
    return { playlist, songs };
  },
);

server.delete(
  "/api/playlist/:id",
  { onRequest: [server.requireAuth] },
  (req, res) => {
    const { id } = req.params as { id: string };
    const playlist = getPlaylistById.get(id);
    if (!playlist) {
      res.code(404);
      return { error: "Playlist not found" };
    }
    if (playlist.user_id !== req.user!.id) {
      res.code(403);
      return { error: "Forbidden" };
    }
    deletePlaylist.run(id);
    res.code(204);
    return null;
  },
);

server.post(
  "/api/playlist/:playlistId/songs",
  { onRequest: [server.requireAuth] },
  async (req, res) => {
    const { playlistId } = req.params as { playlistId: string };
    try {
      const playlist = getPlaylistById.get(playlistId);
      if (!playlist) {
        res.code(404);
        return { error: "Playlist not found" };
      }
      if (playlist.user_id !== req.user!.id) {
        res.code(403);
        return { error: "Forbidden" };
      }

      const response = await fetch(
        "http://localhost:8500/v1/health/service/Catalog?passing=true",
        { signal: AbortSignal.timeout(3000) },
      );
      const services = await response.json();
      if (!Array.isArray(services) || !services.length) {
        res.code(400);
        return { error: "Catalog service offline" };
      }

      const service = services[0];
      const body = AddSongSchema.parse(req.body);
      const url = `http://${service.Service.Address}:${service.Service.Port}/api/catalog/songs/${body.song_id}`;
      const response2 = await fetch(url, { signal: AbortSignal.timeout(3000) });
      if (!response2.ok) {
        res.code(400);
        return { error: "Song does not exist" };
      }

      const position = getSongPosition.get(playlistId);
      if (position === undefined || position === null) {
        res.code(500);
        return { error: "Internal error" };
      }

      insertPlaylistSong.run(playlistId, body.song_id, position, Date.now());
      return { position };
    } catch (error) {
      res.code(400);
      return { error: "Internal error" };
    }
  },
);

server.delete(
  "/api/playlist/:playlistId/songs/:songId",
  { onRequest: [server.requireAuth] },
  (req, res) => {
    const { playlistId, songId } = req.params as {
      playlistId: string;
      songId: string;
    };
    const playlist = getPlaylistById.get(playlistId);
    if (!playlist) {
      res.code(404);
      return { error: "Playlist not found" };
    }
    if (playlist.user_id !== req.user!.id) {
      res.code(403);
      return { error: "Forbidden" };
    }
    const result = removeSong.run(playlistId, songId);
    if (result.changes === 0) {
      res.code(404);
      return { error: "Song not in playlist" };
    }
    res.code(204);
    return null;
  },
);

await registerAndStart(server, {
  name,
  address,
  port: Number(port),
});
