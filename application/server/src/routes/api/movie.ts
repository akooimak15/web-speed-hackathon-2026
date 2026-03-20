import { promises as fs } from "fs";
import { tmpdir } from "os";
import path from "path";
import { execFile } from "child_process";
import { promisify } from "util";

import { Router } from "express";
import httpErrors from "http-errors";
import { v4 as uuidv4 } from "uuid";

import { UPLOAD_PATH } from "@web-speed-hackathon-2026/server/src/paths";

const execFileAsync = promisify(execFile);
const EXTENSION = "gif";

export const movieRouter = Router();

movieRouter.post("/movies", async (req, res) => {
  if (req.session.userId === undefined) throw new httpErrors.Unauthorized();
  if (!Buffer.isBuffer(req.body)) throw new httpErrors.BadRequest();

  const movieId = uuidv4();
  const tmpIn = path.join(tmpdir(), `${movieId}-in`);
  const outPath = path.resolve(UPLOAD_PATH, `./movies/${movieId}.${EXTENSION}`);

  await fs.mkdir(path.resolve(UPLOAD_PATH, "movies"), { recursive: true });
  await fs.writeFile(tmpIn, req.body);

  await execFileAsync("ffmpeg", [
    "-i", tmpIn,
    "-t", "5",
    "-r", "10",
    "-vf", "crop='min(iw,ih)':'min(iw,ih)'",
    "-an",
    outPath,
  ]);

  await fs.unlink(tmpIn).catch(() => {});

  return res.status(200).json({ id: movieId });
});
