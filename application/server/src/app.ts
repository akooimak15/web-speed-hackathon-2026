import Express from "express";
import { apiRouter } from "@web-speed-hackathon-2026/server/src/routes/api";
import { staticRouter } from "@web-speed-hackathon-2026/server/src/routes/static";
import { sessionMiddleware } from "@web-speed-hackathon-2026/server/src/session";

export const app = Express();

app.set("trust proxy", true);
app.use(sessionMiddleware);
app.use(Express.json());
app.use(Express.raw({ limit: "10mb" }));

app.use("/api/v1", (_req, res, next) => {
  res.header("Cache-Control", "no-store");
  return next();
});

app.use("/api/v1", apiRouter);
app.use(staticRouter);