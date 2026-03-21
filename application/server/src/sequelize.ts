import * as fs from "node:fs/promises";
import * as os from "node:os";
import * as path from "node:path";
import { Sequelize } from "sequelize";
import { initModels } from "@web-speed-hackathon-2026/server/src/models";
import { DATABASE_PATH } from "@web-speed-hackathon-2026/server/src/paths";

let _sequelize: Sequelize | null = null;

export async function initializeSequelize() {
  const prevSequelize = _sequelize;
  _sequelize = null;
  await prevSequelize?.close();

  const TEMP_PATH = path.resolve(
    await fs.mkdtemp(path.resolve(os.tmpdir(), "./wsh-")),
    "./database.sqlite",
  );
  await fs.copyFile(DATABASE_PATH, TEMP_PATH);

  _sequelize = new Sequelize({
    dialect: "sqlite",
    logging: false,
    storage: TEMP_PATH,
    pool: { max: 1 },
  });

  await _sequelize.query("PRAGMA journal_mode = WAL;");
  await _sequelize.query("PRAGMA synchronous = NORMAL;");
  await _sequelize.query("PRAGMA cache_size = -64000;");
  await _sequelize.query("PRAGMA temp_store = MEMORY;");

  initModels(_sequelize);
}
