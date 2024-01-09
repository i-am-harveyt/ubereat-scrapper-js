import getNearShop from "./getNearShop.js";
import { readCSV } from "danfojs-node";
import { mkdirSync } from "fs";

const WORKER_LIM = 1;

async function wait(time) {
  return new Promise((resolve) => setTimeout(() => resolve(1), time));
}

async function main() {
  const date = new Date();
  const TODAY = `${date.getFullYear()}-${
    date.getMonth() + 1
  }-${date.getDate()}`;

  const PATH = `../../../uber_data/shopLst/${TODAY}`;

  // 確保輸出目錄存在
  mkdirSync(PATH, { recursive: true });
  mkdirSync("./cookies", { recursive: true });

  // read central location information
  const centerStream = await readCSV("../../inputCentral/tw_points.csv", {
    header: true,
  });
  const centerLst = centerStream.loc({
    columns: ["newLat", "newLng"],
  }).values;

  let count = 1;
  let worker_num = WORKER_LIM;
  let line = 1;

  for (const loc of centerLst) {
    /* multi-worker */
    if (worker_num === 0) {
      console.log(`${line++} ${loc} is waiting`);
      await wait(10_000);
      worker_num = WORKER_LIM;
    }
    worker_num--;

    console.log(`The ${count++}th location: (${loc[0]}, ${loc[1]})`);
    try {
      // await getNearShop(date, loc[0], loc[1]);

      /* multi-worker */
      getNearShop(date, loc[0], loc[1]);
    } catch (e) {
      console.log(e);
    }
  }
  await wait(10_000);

  // console.log("final number of resuarant in total: ", shopData.length);
  console.log("down shop catch");
}

try {
  await main();
} catch (e) {
  console.log("Totally failed");
  console.error(e);
}
