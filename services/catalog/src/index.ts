import { consul } from "@my-music/service-registry";
import { randomUUID } from "crypto";
import Fastify from "fastify";

const server = Fastify({ logger: true });

server.get("/health", (req, res) => {
  res.send(true);
});

server.get("/api/catalog/songs", (req, res) => {
  res.send("All songs");
});

process.on("SIGINT", deregisterService);
process.on("SIGTERM", deregisterService);

const id = randomUUID();

server.listen({ port: 3000 }, async (err) => {
  await consul.registerService({
    name: "Catalog",
    id,
    address: "localhost",
    port: 3000,
    tags: [],
  });
  console.log("Server started");
});

let shuttingDown = false;
async function deregisterService() {
  if (shuttingDown) return;
  shuttingDown = true;
  await consul.deregisterService(id);
  process.exit(0);
}
