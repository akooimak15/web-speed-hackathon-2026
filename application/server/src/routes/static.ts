import history from "connect-history-api-fallback";
import { Router } from "express";
import serveStatic from "serve-static";
import {
  CLIENT_DIST_PATH,
  PUBLIC_PATH,
  UPLOAD_PATH,
} from "@web-speed-hackathon-2026/server/src/paths";

export const staticRouter = Router();

// アップロードファイル: 短めのキャッシュ
staticRouter.use(
  serveStatic(UPLOAD_PATH, {
    maxAge: "1y",
    immutable: true,
  }),
);

// publicアセット: 短めのキャッシュ
staticRouter.use(
  serveStatic(PUBLIC_PATH, {
    maxAge: "1y",
    immutable: true,
  }),
);

// ハッシュ付きビルド成果物: 永続キャッシュ
staticRouter.use(
  serveStatic(CLIENT_DIST_PATH, {
    maxAge: "1y",
    immutable: true,
  }),
);

// SPA fallback はキャッシュ対象外のため最後に配置
staticRouter.use(history());
staticRouter.use(
  serveStatic(CLIENT_DIST_PATH, {
    maxAge: "1y",
    immutable: true,
  }),
);