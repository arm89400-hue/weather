import { createServer } from "node:http";
import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { logger } from "./lib/logger.js";
import { createWebSocketGateway } from "./websocket/gateway.js";

const app = createApp();
const httpServer = createServer(app);
createWebSocketGateway(httpServer);

httpServer.listen(env.PORT, () => {
  logger.info(`API server listening on port ${env.PORT}`);
});
