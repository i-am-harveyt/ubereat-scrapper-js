import getNearShop from "./getNearShop.js";
import { Cookie } from "./Cookie.js";
import { readCSV } from "danfojs-node";
import { mkdirSync } from "fs";

async function main() {
	const date = new Date();
	const TODAY = `${date.getFullYear()}-${date.getMonth() + 1
		}-${date.getDate()}`;
	
	const PATH = `../../../uber_data/shopLst/${TODAY}`;

	// 確保輸出目錄存在
	mkdirSync(PATH, { recursive: true });
	mkdirSync("./cookies", { recursive: true });

	// read central location information
	const centerStream = await readCSV("../../inputCentral/demo.csv", {
		header: true,
	});
	const centerLst = centerStream.loc({
		columns: ["newLat", "newLng"],
	}).values;

	let cookie = new Cookie();
	cookie.init();
	let count = 1;

	for (const loc of centerLst) {
		console.log(`The ${count++}th location: (${loc[0]}, ${loc[1]})`);
		try {
			await getNearShop(cookie, date, loc[0], loc[1]);
		} catch (e) {
			console.log(e);
		}
	}

	// console.log("final number of resuarant in total: ", shopData.length);
	console.log("down shop catch");
}

try {
	await main();
} catch (e) {
	console.log("Totally failed");
	console.error(e);
}
