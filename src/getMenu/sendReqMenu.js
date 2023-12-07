import { Cookie } from "../getShop/Cookie";

/**
 * This function is used to send request and get response
 * @param {Cookie} cookie
 * @param {string} shopUuid
 * @param {number} latitude
 * @param {number} longitude
 * @returns Promise<Response> | boolean
 */
export default async function sendReqMenu(
	cookie,
	shopUuid,
	latitude,
	longitude
) {
	try {
		return await fetch(
			"https://www.ubereats.com/_p/api/getStoreV1?localeCode=tw",
			{
				headers: {
					accept: "*/*",
					"accept-language": "en-US,en;q=0.9",
					"content-type": "application/json",
					"sec-ch-prefers-color-scheme": "dark",
					"sec-ch-ua": '"Chromium";v="119", "Not?A_Brand";v="24"',
					"sec-ch-ua-mobile": "?0",
					"sec-ch-ua-platform": '"macOS"',
					"sec-fetch-dest": "empty",
					"sec-fetch-mode": "cors",
					"sec-fetch-site": "same-origin",
					"x-csrf-token": "x",
					"x-uber-client-gitref": "b6782086d4ce4feb4b34bfbdda29fc342b2fa274",
					cookie: cookie.gen(latitude, longitude),
				},
				body: JSON.stringify({
					storeUuid: shopUuid,
					diningMode: "DELIVERY",
				}),
				method: "POST",
			}
		);
	} catch (e) {
		console.error(e);
	}
	return false;
}
