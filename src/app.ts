import express from "express";
import notificationRouter from "./routes/notification.route.js";
import { rateLimiter } from "./middlewares/rate-limiter.middleware.js";
import { idempotencyMiddleware } from "./middlewares/idempotency.middleware.js";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set("trust proxy", true);

app.use(
  "/api/notification",
  rateLimiter,
  idempotencyMiddleware,
  notificationRouter,
);

export default app;
