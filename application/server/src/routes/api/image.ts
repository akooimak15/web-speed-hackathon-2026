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
const EXTENSION = "jpg";

export const imageRouter = Router();

imageRouter.post("/images", async (req, res) => {
  if (req.session.userId === undefined) throw new httpErrors.Unauthorized();
  if (!Buffer.isBuffer(req.body)) throw new httpErrors.BadRequest();

  const imageId = uuidv4();
  const tmpIn = path.join(tmpdir(), `${imageId}-in`);
  const outPath = path.resolve(UPLOAD_PATH, `./images/${imageId}.${EXTENSION}`);

  await fs.mkdir(path.resolve(UPLOAD_PATH, "images"), { recursive: true });
  await fs.writeFile(tmpIn, req.body);

  await execFileAsync("ffmpeg", [
    "-i", tmpIn,
    outPath,
    "-y",
  ]);

  await fs.unlink(tmpIn).catch(() => {});

  return res.status(200).json({ id: imageId });
});