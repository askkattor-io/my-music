const COMMON = {
  JWT_SECRET: "sadanklNKLW3N123KmklamklMsaklsmalksmalk",
};

const catalogDb =
  "/Users/emilarnaudov/Documents/personal/my-music/services/catalog/data/catalog.db";
const playbackDb =
  "/Users/emilarnaudov/Documents/personal/my-music/services/playback/data/playback.db";
const playlistDb =
  "/Users/emilarnaudov/Documents/personal/my-music/services/playlist/data/playlist.db";
const userDb =
  "/Users/emilarnaudov/Documents/personal/my-music/services/user/data/user.db";

module.exports = {
  apps: [
    {
      name: "catalog-server-1",
      script: "npx tsx watch services/catalog/src/index.ts",
      env: {
        ...COMMON,
        SERVICE_NAME: "Catalog",
        SERVICE_ADDRESS: "localhost",
        SERVICE_PORT: "3000",
        SERVICE_DB_PATH: catalogDb,
      },
    },
    {
      name: "catalog-server-2",
      script: "npx tsx watch services/catalog/src/index.ts",
      env: {
        ...COMMON,
        SERVICE_NAME: "Catalog",
        SERVICE_ADDRESS: "localhost",
        SERVICE_PORT: "3001",
        SERVICE_DB_PATH: catalogDb,
      },
    },
    {
      name: "playback-server-1",
      script: "npx tsx watch services/playback/src/index.ts",
      env: {
        ...COMMON,
        SERVICE_NAME: "Playback",
        SERVICE_ADDRESS: "localhost",
        SERVICE_PORT: "3002",
        SERVICE_DB_PATH: playbackDb,
      },
    },
    {
      name: "playback-server-2",
      script: "npx tsx watch services/playback/src/index.ts",
      env: {
        ...COMMON,
        SERVICE_NAME: "Playback",
        SERVICE_ADDRESS: "localhost",
        SERVICE_PORT: "3003",
        SERVICE_DB_PATH: playbackDb,
      },
    },
    {
      name: "playlist-server-1",
      script: "npx tsx watch services/playlist/src/index.ts",
      env: {
        ...COMMON,
        SERVICE_NAME: "Playlist",
        SERVICE_ADDRESS: "localhost",
        SERVICE_PORT: "3004",
        SERVICE_DB_PATH: playlistDb,
      },
    },
    {
      name: "playlist-server-2",
      script: "npx tsx watch services/playlist/src/index.ts",
      env: {
        ...COMMON,
        SERVICE_NAME: "Playlist",
        SERVICE_ADDRESS: "localhost",
        SERVICE_PORT: "3005",
        SERVICE_DB_PATH: playlistDb,
      },
    },
    {
      name: "user-server-1",
      script: "npx tsx watch services/user/src/index.ts",
      env: {
        ...COMMON,
        SERVICE_NAME: "User",
        SERVICE_ADDRESS: "localhost",
        SERVICE_PORT: "3006",
        SERVICE_DB_PATH: userDb,
      },
    },
    {
      name: "user-server-2",
      script: "npx tsx watch services/user/src/index.ts",
      env: {
        ...COMMON,
        SERVICE_NAME: "User",
        SERVICE_ADDRESS: "localhost",
        SERVICE_PORT: "3007",
        SERVICE_DB_PATH: userDb,
      },
    },
  ],
};
