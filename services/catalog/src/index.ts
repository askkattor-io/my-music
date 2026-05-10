import { registerAndStart } from "@my-music/service-registry";
import Fastify from "fastify";

const name = process.env["SERVICE_NAME"];
const address = process.env["SERVICE_ADDRESS"];
const port = process.env["SERVICE_PORT"];

if (!name || !address || !port) {
  throw new Error("Missing env variables, please provide");
}

const server = Fastify({ logger: true });

server.get("/health", (req, res) => {
  res.send(true);
});

server.get("/api/catalog/songs", (req, res) => {
  res.send("All songs");
});

await registerAndStart(server, {
  name,
  address,
  port: Number(port),
});
