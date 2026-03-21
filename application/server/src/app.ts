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

// 認証不要な読み取りAPIにキャッシュを設定
app.use("/api/v1", (req, res, next) => {
  if (req.method === "GET" && !req.path.startsWith("/me") && !req.path.startsWith("/dm")) {
    res.header("Cache-Control", "public, max-age=10, stale-while-revalidate=60");
  } else {
    res.header("Cache-Control", "no-store");
  }
  return next();
});

app.use("/api/v1", apiRouter);
app.use(staticRouter);
