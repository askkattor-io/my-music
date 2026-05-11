# my-music

A small Spotify-style backend built while going through Node.js Design Patterns (Chapter 12 — Scalability). The idea was to actually implement Y-axis (splitting logic into services that can be scaled independently) scaling properly, not just read about it.

## What it does

Four services that talk to each other:

- **User** — signup, login, JWT auth
- **Catalog** — songs database, add/list/get songs
- **Playlist** — create playlists, add songs to them (validates songs exist by calling the Catalog service)
- **Playback** — log when you play a song, get your play history

Each service has its own SQLite database. They don't share schemas or tables — if the Playlist service needs to know if a song exists, it makes an HTTP call to Catalog, it doesn't reach into Catalog's database.

## Infrastructure

- **Consul** — service registry. Each service registers itself on start and deregisters on shutdown.
- **consul-template** — watches Consul and regenerates an nginx upstream config whenever services come online/offline.
- **nginx** — API gateway and load balancer. Sits in front of everything, routes `/api/catalog/` → Catalog, `/api/playlist/` → Playlist, etc.
- **pm2** — runs 2 instances of each service so you can actually see the load balancing work.

The interesting bit is that inter-service calls bypass nginx entirely. When Playlist needs to verify a song exists, it asks Consul directly for a healthy Catalog instance and calls it by address. nginx is only for external clients.

## Running it

You need Consul, consul-template, and nginx installed locally.

```bash
# start infra
consul agent -dev &
consul-template -config=infra/consul-template/config.hcl &
nginx -c $(pwd)/infra/nginx/nginx.conf

# start all services
pm2 start ecosystem.config.cjs
pm2 logs
```

## Stack

Node.js, TypeScript, Fastify, better-sqlite3, JWT (HS256), bcrypt, nanoid, zod — npm workspaces monorepo.
