import { registerAndStart } from "@my-music/service-registry";
import Fastify from "fastify";
import { db, findUserByEmail, insertUser } from "./db.js";
import * as z from "zod";
import bcrypt from "bcrypt";
import { nanoid } from "nanoid";
import { sign } from "jsonwebtoken";
import authPlugin from "@my-music/auth";

const name = process.env["SERVICE_NAME"];
const address = process.env["SERVICE_ADDRESS"];
const port = process.env["SERVICE_PORT"];
const secret = process.env["JWT_SECRET"];

if (!name || !address || !port || !secret) {
  throw new Error("Missing env variables, please provide");
}

const User = z.object({
  email: z.email(),
  password: z.string(),
});

const server = Fastify({ logger: true });

await server.register(authPlugin, { secret });

server.get("/health", (req, res) => {
  return true;
});

server.post("/api/user/signup", async (req, res) => {
  try {
    const body = User.parse(req.body);
    const id = nanoid();
    const email = body.email;
    const hashed = await bcrypt.hash(body.password, 10);
    insertUser.run(id, email, hashed, Date.now());
    const token = sign({ email }, secret, {
      subject: id,
      issuer: name,
      expiresIn: "2d",
    });

    res.code(200);
    return { token };
  } catch (error) {
    res.code(400);
    return { error: "Bad request" };
  }
});
server.post("/api/user/login", async (req, res) => {
  try {
    const body = User.parse(req.body);
    const user = findUserByEmail.get(body.email) as
      | { id: string; email: string; password_hash: string }
      | undefined;
    if (!user) {
      res.code(401);
      return { error: "Invalid credentials" };
    }

    const passCorrect = await bcrypt.compare(body.password, user.password_hash);
    if (!passCorrect) {
      res.code(401);
      return { error: "Invalid credentials" };
    }

    const token = sign({ email: user.email }, secret, {
      subject: user.id,
      issuer: name,
      expiresIn: "2d",
    });

    return { token };
  } catch (error) {
    res.code(400);
    return { error: "Bad request" };
  }
});
server.get("/api/user/me", { onRequest: [server.requireAuth] }, async (req) => {
  return { id: req.user!.id, email: req.user!.email };
});

console.log("DB Initialized: ", db.name);

await registerAndStart(server, {
  name,
  address,
  port: Number(port),
});
