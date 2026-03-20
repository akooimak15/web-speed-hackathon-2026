import { promises as fs } from "fs";
import { tmpdir } from "os";
import path from "path";
import { execFile } from "child_process";
import { promisify } from "util";

import { Router } from "express";
import httpErrors from "http-errors";
import { v4 as uuidv4 } from "uuid";

import { UPLOAD_PATH } from "@web-speed-hackathon-2026/server/src/paths";
import { extractMetadataFromSound } from "@web-speed-hackathon-2026/server/src/utils/extract_metadata_from_sound";

const execFileAsync = promisify(execFile);
const EXTENSION = "mp3";

export const soundRouter = Router();

soundRouter.post("/sounds", async (req, res) => {
  if (req.session.userId === undefined) throw new httpErrors.Unauthorized();
  if (!Buffer.isBuffer(req.body)) throw new httpErrors.BadRequest();

  const soundId = uuidv4();
  const tmpIn = path.join(tmpdir(), `${soundId}-in`);
  const outPath = path.resolve(UPLOAD_PATH, `./sounds/${soundId}.${EXTENSION}`);

  await fs.mkdir(path.resolve(UPLOAD_PATH, "sounds"), { recursive: true });
  await fs.writeFile(tmpIn, req.body);

  const { artist, title } = await extractMetadataFromSound(req.body);

  await execFileAsync("ffmpeg", [
    "-i", tmpIn,
    "-metadata", `artist=${artist}`,
    "-metadata", `title=${title}`,
    "-vn",
    outPath,
    "-y",
  ]);

  await fs.unlink(tmpIn).catch(() => {});

  return res.status(200).json({ artist, id: soundId, title });
});
