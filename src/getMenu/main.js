import getMenu from "./getMenu.js";
import { Cookie } from "./Cookie.js";
import { mkdirSync, readdirSync } from "fs";
import { readCSV } from "danfojs-node";
import { DataFrame } from "danfojs-node";
import { fileURLToPath } from "url";

async function main() {
  const date = new Date();
  const TODAY = `${date.getFullYear()}-${
    date.getMonth() + 1
  }-${date.getDate()}`;

  const PATH = `../../../uber_data/uber_menu/${TODAY}`;

  // 確保輸出目錄存在
  mkdirSync(PATH, { recursive: true });

  // read shopinformation
  const locationPath = `../../../uber_data/shopLst/${TODAY}`;
  let locationLst = readdirSync(locationPath);
  const menuPath = `../../../uber_data/uber_menu/${TODAY}`;

  // init cookie
  let cookie = new Cookie();
  cookie.init();

  for (const location of locationLst) {
    let stores = [];
    let df = await readCSV(`${locationPath}/${location}`);
    df = df.loc({
      columns: ["storeUuid", "name", "anchor_latitude", "anchor_longitude"],
    }).values;
    console.log(`(${df[0][2]}, ${df[0][3]}): ${df.length} shops`);
    for (const row of df) {
      try {
        stores.push(await getMenu(cookie, row[0], row[1], row[2], row[3]));
      } catch (e) {
        let cnt = 0;
        while (cnt < 3) {
          cnt += 1;
          try {
            stores.push(await getMenu(cookie, row[0], row[1], row[2], row[3]));
            break;
          } catch (er) {
            console.error(er);
          }
        }
        console.error(e);
      }
    }
    const result = new DataFrame(stores);
    result.toCSV({
      filePath: `${menuPath}/${location}_${TODAY}.csv`,
      header: true,
    });
  }

  console.log("down shop catch");
}

try {
  await main();
} catch (e) {
  console.log("Totally failed");
  console.error(e);
}
