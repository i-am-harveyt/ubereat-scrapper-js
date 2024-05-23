import sendReqMenu from "./sendReqMenu.js";
import { Cookie } from "./Cookie.js";
import { mkdirSync, writeFileSync } from "fs";
import extractData from "./extractData.js";

/**
 *
 * @param {Cookie} cookie
 * @param {string} shopUuid
 * @param {string} shopName
 * @param {number} latitude
 * @param {number} longitude
 */
export default async function getMenu(
	cookie,
	shopUuid,
	shopName,
	latitude,
	longitude
) {
	let get = await fetch(
		"https://www.ubereats.com/tw/feed?diningMode=DELIVERY",
		{ vervose: true }
	);
	cookie.updateCookies(get.headers.getSetCookie().join("; "));
	cookie.setCookie("mcd_restaurant", "");

	let now = new Date();

	// fetch logic
	await new Promise((resolve) => setTimeout(resolve, Math.random() * 2000));
	try {
		let response = await sendReqMenu(cookie, shopUuid, latitude, longitude);
		const data = await response.json();
		// data conversion
		const jsonPath = `../../../uber_data/uber_menu/json/`;
		const today = `${now.getMonth() + 1}-${now.getDate()}`;
		mkdirSync(jsonPath, { recursive: true });
		writeFileSync(
			`${jsonPath}/${shopUuid}-${today}.json`,
			JSON.stringify(data)
		);
		return extractData(data.data, now, latitude, longitude);
	} catch (e) {
		throw e;
	}
}
