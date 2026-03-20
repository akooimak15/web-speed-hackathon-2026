import Express from "express";
import compression from "compression";
import { createGunzip } from "zlib";
import { apiRouter } from "@web-speed-hackathon-2026/server/src/routes/api";
import { staticRouter } from "@web-speed-hackathon-2026/server/src/routes/static";
import { sessionMiddleware } from "@web-speed-hackathon-2026/server/src/session";

export const app = Express();

app.set("trust proxy", true);
app.use(compression());
app.use(sessionMiddleware);

// gzip圧縮されたJSONを解凍
app.use((req, _res, next) => {
  if (req.headers["content-encoding"] === "gzip") {
    const gunzip = createGunzip();
    const chunks: Buffer[] = [];
    req.pipe(gunzip);
    gunzip.on("data", (chunk) => chunks.push(chunk));
    gunzip.on("end", () => {
      req.body = JSON.parse(Buffer.concat(chunks).toString());
      next();
    });
    gunzip.on("error", next);
  } else {
    next();
  }
});

app.use(Express.json());
app.use(Express.raw({ limit: "10mb" }));

app.use("/api/v1", (_req, res, next) => {
  res.header("Cache-Control", "no-store");
  return next();
});

app.use("/api/v1", apiRouter);
app.use(staticRouter);
