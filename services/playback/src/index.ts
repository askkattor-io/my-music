import { registerAndStart } from "@my-music/service-registry";
import Fastify from "fastify";
import authPlugin from "@my-music/auth";
import * as z from "zod";
import { insertPlayEvent, getPlayHistoryByUser } from "./db.js";

const name = process.env["SERVICE_NAME"];
const address = process.env["SERVICE_ADDRESS"];
const port = process.env["SERVICE_PORT"];
const secret = process.env["JWT_SECRET"];

if (!name || !address || !port || !secret) {
  throw new Error("Missing env variables, please provide");
}

const server = Fastify({ logger: true });

await server.register(authPlugin, { secret });

const PlaySchema = z.object({
  song_id: z.string(),
});

server.get("/health", (req, res) => {
  return true;
});

server.post(
  "/api/playback/play",
  { onRequest: [server.requireAuth] },
  (req, res) => {
    try {
      const body = PlaySchema.parse(req.body);
      insertPlayEvent.run(req.user!.id, body.song_id, Date.now());
      return { ok: true };
    } catch (error) {
      res.code(400);
      return { error: "Invalid request" };
    }
  },
);

server.get(
  "/api/playback/history",
  { onRequest: [server.requireAuth] },
  (req, res) => {
    return getPlayHistoryByUser.all(req.user!.id);
  },
);

await registerAndStart(server, {
  name,
  address,
  port: Number(port),
});
