import getNearShop from "./getNearShop.js";
import { readCSV, concat } from "nodejs-polars";
import { mkdirSync } from "fs";
import { Logger } from "../lib/Logger.js";
import concatRolling from "./concatRolling.js";

const date = new Date();
const TODAY = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
const logger = new Logger(`./${TODAY}.log`);

async function main() {
  const PATH = `../../../uber_data/shopLst/${TODAY}`;

  // 確保輸出目錄存在
  try {
    mkdirSync(PATH, { recursive: true });
    mkdirSync("./cookies", { recursive: true });
  } catch (e) {
    logger.error(e);
  }

  // read central location information
  const tw_points = readCSV("../../inputCentral/tw_points.csv").select([
    "newLat",
    "newLng",
  ]);
  const newAnchors = readCSV(
    "../../inputCentral/new_anchors_filtered.csv",
  ).select(["newLat", "newLng"]);
  const centerLst = concat([tw_points, newAnchors]);

  for (const row of centerLst.rows()) {
    try {
      logger.info(`(${row[0]}, ${row[1]})`);
      await getNearShop(TODAY, row[0], row[1], date.getDate() == 10, logger);
    } catch (e) {
      logger.error(e);
    }
  }
  concatRolling(TODAY, logger);

  logger.log("down shop catch");
}

try {
  main();
} catch (e) {
  logger.error("Totally failed");
}
