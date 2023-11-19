import sendReq from "./sendReq.js";
import { DataFrame } from "danfojs-node";
import findValues from "./findValues.js";
import { Cookie } from "./Cookie.js";

/**
 * get the restaurants nearby the given latitude and longitude
 * @param {Cookie} cookie
 * @param {Date} date the date object of today
 * @param {number} lat latitude
 * @param {number} lng longitude
 */
export default async function getNearShop(
	cookie,
	date,
	lat = 25.0173405,
	lng = 121.5397518
) {
	let result = {
		storeUuid: [],
		name: [],
		latitude: [],
		longitude: [],
		anchor_latitude: [],
		anchor_longitude: [],
		score: [],
		rating: [],
		orderable: [],
	};

	const PAGE_SIZE = 80;
	const TODAY = `${date.getFullYear()}-${
		date.getMonth() + 1
	}-${date.getDate()}`;

	let offset = 0;

	const fileNameStr = `../uber_data/shopLst/${TODAY}/shopLst_${lat}_${lng}_${TODAY}.csv`;

	await new Promise((resolve) =>
		setTimeout(resolve, Math.random() * 4000 + 1000 * 5)
	);
	let get = await fetch(
		"https://www.ubereats.com/tw/feed?diningMode=DELIVERY",
		true
	);
	cookie.updateCookies(get.headers.getSetCookie().join("; "));

	let roundCount = 0;

	while (true) {
		roundCount += 1;
		console.log(roundCount, offset);
		// wait for a couple seconds
		await new Promise((resolve) =>
			setTimeout(resolve, Math.random() * 4000 + 1000 * 5)
		);

		// send the request
		let response = await sendReq(cookie, lat, lng, offset, PAGE_SIZE);
		if (!response) break;

		// update cookies
		cookie.updateCookies(response.headers.getSetCookie().join("; "));

		try {
			let items = (await response.json())["data"]["feedItems"];
			let stores = [];
			for (const e of items)
				if (e.type === "REGULAR_STORE")
					stores.push(e["store"]);

			if (!stores || stores.length < 1) break;
			offset += stores.length;

			for (const e of stores) {
				try {
					let uuid = e["storeUuid"];
					let title = e["title"]["text"];
					result.storeUuid.push(uuid);
					result.name.push(title);
				} catch (e) {
					continue;
				}

				try {
					let mapMarker = e["mapMarker"];
					result.latitude.push(mapMarker["latitude"]);
					result.longitude.push(mapMarker["longitude"]);
				} catch (e) {
					result.latitude.push(NaN);
					result.longitude.push(NaN);
				}

				try {
					let rating = e["rating"]["text"];
					result.rating.push(rating);
				} catch (e) {
					result.rating.push(NaN);
				}

        // the scores seems do something on the sorting order
				try {
					let score = e["tracking"]["storePayload"]["score"]["total"];
					result.score.push(score);
				} catch (e) {
					result.score.push(NaN);
				}

				try {
					let orderable = e["tracking"]["storePayload"]["isOrderable"];
					result.orderable.push(orderable);
				} catch (e) {
					result.orderable.push(NaN);
				}
			}
		} catch (error) {
			console.error(error);
			break;
		}
	}

	// report
	console.log(lat, lng, "storeUuid num", result.storeUuid.length);
	if (result.storeUuid.length === 0) return;

	result.anchor_latitude = Array.from(
		{ length: result.storeUuid.length },
		() => lat
	);
	result.anchor_longitude = Array.from(
		{ length: result.storeUuid.length },
		() => lng
	);
	result.date = Array.from({ length: result.storeUuid.length }, () => TODAY);
	let df = new DataFrame(result);

	df.toCSV({ filePath: fileNameStr, header: true });
}
