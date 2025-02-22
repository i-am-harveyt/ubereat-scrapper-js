import getMenu from "./getMenu.js";
import { Cookie } from "./Cookie.js";
import { mkdirSync, readdirSync, readvSync } from "fs";
import { readCSV, DataFrame } from "nodejs-polars";
import { Logger } from "../lib/Logger.js";

const date = new Date();
const TODAY = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
const logger = new Logger(`./${TODAY}_menu.log`);

async function main() {
  const PATH = `../../../uber_data/uber_menu/${TODAY}`;

  // 確保輸出目錄存在
  try {
    mkdirSync(PATH, { recursive: true });
  } catch (e) {}

  // read shop information
  const rollingPath = `../../../uber_data/shopLst/rolling.csv`;
  const rolling = readCSV(rollingPath).select([
    "storeUuid",
    "name",
    "anchor_latitude",
    "anchor_longitude",
  ]);
  const menuPath = `../../../uber_data/uber_menu/${TODAY}`;

  // init cookie
  let cookie = new Cookie();
  cookie.init();

  let stores = [];
  for (const row of rolling.rows()) {
    logger.info(row);
    try {
      stores.push(
        await getMenu(
          cookie,
          row[0],
          row[1],
          row[2],
          row[3],
          date.getDate() >= 10 && date.getDate() < 17,
          logger,
        ),
      );
    } catch (e) {
      let cnt = 0;
      while (cnt < 3) {
        cnt += 1;
        try {
          stores.push(
            await getMenu(
              cookie,
              row[0],
              row[1],
              row[2],
              row[3],
              date.getDate() >= 10 && date.getDate() < 17,
              logger,
            ),
          );
          break;
        } catch (er) {
          logger.error(er);
        }
      }
      logger.error(e);
    }
    const result = DataFrame(stores);
    result.writeCSV(`${menuPath}/${TODAY}.csv`);
  }

  logger.info("down shop catch");
}

try {
  main();
} catch (e) {
  logger.error(`Totally failed ${e}`);
}
