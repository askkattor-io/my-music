module.exports = {
  apps: [
    {
      name: "catalog-server-1",
      script: "npx tsx watch services/catalog/src/index.ts",
      env: {
        SERVICE_NAME: "Catalog",
        SERVICE_ADDRESS: "localhost",
        SERVICE_PORT: "3000",
      },
    },
    {
      name: "catalog-server-2",
      script: "npx tsx watch services/catalog/src/index.ts",
      env: {
        SERVICE_NAME: "Catalog",
        SERVICE_ADDRESS: "localhost",
        SERVICE_PORT: "3001",
      },
    },
    {
      name: "playback-server-1",
      script: "npx tsx watch services/playback/src/index.ts",
      env: {
        SERVICE_NAME: "Playback",
        SERVICE_ADDRESS: "localhost",
        SERVICE_PORT: "3002",
      },
    },
    {
      name: "playback-server-2",
      script: "npx tsx watch services/playback/src/index.ts",
      env: {
        SERVICE_NAME: "Playback",
        SERVICE_ADDRESS: "localhost",
        SERVICE_PORT: "3003",
      },
    },
    {
      name: "playlist-server-1",
      script: "npx tsx watch services/playlist/src/index.ts",
      env: {
        SERVICE_NAME: "Playlist",
        SERVICE_ADDRESS: "localhost",
        SERVICE_PORT: "3004",
      },
    },
    {
      name: "playlist-server-2",
      script: "npx tsx watch services/playlist/src/index.ts",
      env: {
        SERVICE_NAME: "Playlist",
        SERVICE_ADDRESS: "localhost",
        SERVICE_PORT: "3005",
      },
    },
    {
      name: "user-server-1",
      script: "npx tsx watch services/user/src/index.ts",
      env: {
        SERVICE_NAME: "User",
        SERVICE_ADDRESS: "localhost",
        SERVICE_PORT: "3006",
        SERVICE_DB_PATH:
          "/Users/emilarnaudov/Documents/personal/my-music/services/user/data/user.db",
        JWT_SECRET: "sadanklNKLW3N123KmklamklMsaklsmalksmalk",
      },
    },
    {
      name: "user-server-2",
      script: "npx tsx watch services/user/src/index.ts",
      env: {
        SERVICE_NAME: "User",
        SERVICE_ADDRESS: "localhost",
        SERVICE_PORT: "3007",
        SERVICE_DB_PATH:
          "/Users/emilarnaudov/Documents/personal/my-music/services/user/data/user.db",
      },
      JWT_SECRET: "sadanklNKLW3N123KmklamklMsaklsmalksmalk",
    },
  ],
};
