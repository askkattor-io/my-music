import { randomUUID } from "crypto";

interface RegisterServiceData {
  name: string;
  id: string;
  address: string;
  port: number;
  tags?: string[];
}

class ConsulClient {
  private baseUrl: string;

  constructor(baseUrl = "http://localhost:8500") {
    this.baseUrl = baseUrl;
  }

  async registerService({
    name,
    id,
    address,
    port,
    tags = [],
  }: RegisterServiceData) {
    const url = `${this.baseUrl}/v1/agent/service/register`;
    const body = {
      Name: name,
      ID: id,
      Address: address,
      Port: port,
      Tags: tags,
      Check: {
        HTTP: `http://${address}:${port}/health`,
        Interval: "5s",
        Timeout: "2s",
        DeregisterCriticalServiceAfter: "30s",
      },
    };

    const response = await fetch(url, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const responseText = await response.text(); // Read the response body to get more details
      throw new Error(
        `Failed to register service: ${response.statusText}\n${responseText}`,
      );
    }
  }

  async deregisterService(serviceId: string) {
    const url = `${this.baseUrl}/v1/agent/service/deregister/${serviceId}`;
    const response = await fetch(url, { method: "PUT" });
    if (response.status === 404) return; // idempotent: already gone is success
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Failed to deregister: ${response.statusText}\n${text}`);
    }
  }

  async getAllServices() {
    const url = `${this.baseUrl}/v1/agent/services`;
    const response = await fetch(url);

    if (!response.ok) {
      const responseText = await response.text();
      throw new Error(
        `Failed to get all services: ${response.statusText}\n${responseText}`,
      );
    }

    return response.json();
  }
}

function registerShutdown(id: string) {
  let shuttingDown = false;
  async function deregisterService() {
    if (shuttingDown) return;
    shuttingDown = true;
    await consul.deregisterService(id);
    process.exit(0);
  }

  process.on("SIGINT", deregisterService);
  process.on("SIGTERM", deregisterService);
}

export async function registerAndStart(
  server: any,
  opts: Omit<RegisterServiceData, "id">,
) {
  const id = randomUUID();
  await server.listen({ port: opts.port });
  await consul.registerService({ ...opts, id });
  registerShutdown(id);

  console.log("Server started");
}

export const consul = new ConsulClient();
