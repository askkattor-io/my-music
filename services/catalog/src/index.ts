import { registerAndStart } from "@my-music/service-registry";
import Fastify from "fastify";
import authPlugin from "@my-music/auth";
import { nanoid } from "nanoid";
import * as z from "zod";
import { insertSong, getSongById, getAllSongs } from "./db.js";

const name = process.env["SERVICE_NAME"];
const address = process.env["SERVICE_ADDRESS"];
const port = process.env["SERVICE_PORT"];
const secret = process.env["JWT_SECRET"];

if (!name || !address || !port || !secret) {
  throw new Error("Missing env variables, please provide");
}

const server = Fastify({ logger: true });

await server.register(authPlugin, { secret });

const CreateSongSchema = z.object({
  title: z.string(),
  artist: z.string(),
  duration: z.number().int().positive(),
});

server.get("/health", (req, res) => {
  return true;
});

server.get("/api/catalog/songs", (req, res) => {
  return getAllSongs.all();
});

server.get("/api/catalog/songs/:id", (req, res) => {
  const { id } = req.params as { id: string };
  const song = getSongById.get(id);
  if (!song) {
    res.code(404);
    return { error: "Song not found" };
  }
  return song;
});

server.post(
  "/api/catalog/songs",
  { onRequest: [server.requireAuth] },
  (req, res) => {
    try {
      const body = CreateSongSchema.parse(req.body);
      const id = nanoid();
      insertSong.run(id, body.title, body.artist, body.duration, Date.now());
      res.code(201);
      return { id };
    } catch (error) {
      res.code(400);
      return { error: "Invalid request" };
    }
  },
);

await registerAndStart(server, {
  name,
  address,
  port: Number(port),
});
