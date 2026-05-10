import fp from "fastify-plugin";
import { type FastifyPluginAsync, type FastifyReply } from "fastify";
import { verify } from "jsonwebtoken";
import * as z from "zod";

const PayloadSchema = z.object({
  sub: z.string(),
  email: z.email(),
  exp: z.number(),
});

declare module "fastify" {
  interface FastifyInstance {
    requireAuth: (req: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }

  interface FastifyRequest {
    user?: { id: string; email: string };
  }
}
interface Options {
  secret: string;
}

const plugin: FastifyPluginAsync<Options> = async (fastify, { secret }) => {
  fastify.decorate("requireAuth", async (req, reply) => {
    const split = req.headers.authorization?.split(" ");
    if (!split) {
      return reply.code(401).send("No auth header");
    }
    const [type, token] = split;

    if (!type || type !== "Bearer") {
      return reply.code(401).send("No auth");
    }

    if (!token) {
      return reply.code(401).send("No auth");
    }
    try {
      const payloadRaw = verify(token, secret);
      const payload = PayloadSchema.parse(payloadRaw);

      req.user = { id: payload.sub, email: payload.email };
    } catch (error) {
      return reply.code(401).send("No auth");
    }
  });
};

export default fp(plugin);
