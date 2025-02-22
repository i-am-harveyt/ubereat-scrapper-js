import { concat, readCSV } from "nodejs-polars";
import { readdirSync } from "fs";
import { Logger } from "../lib/Logger.js";

/**
 * @param {string} today
 * @param {Logger} logger
 */
export default function concatRolling(today, logger) {
  const rollingDir = `../../../uber_data/shopLst/rolling.csv`;
  let rolling = readCSV(rollingDir);
  const shopsDir = `../../../uber_data/shopLst/`;
  const todayShopsDir = `${shopsDir}/${today}/`;
  const files = readdirSync(todayShopsDir);
  for (const file of files) {
    try {
      rolling = concat([rolling, readCSV(`${todayShopsDir}/${file}`)]).unique({
        subset: ["storeUuid"],
        keep: "first",
      });
    } catch (e) {
      logger.error(e.toString());
    }
  }
  rolling.writeCSV(rollingDir);
}
