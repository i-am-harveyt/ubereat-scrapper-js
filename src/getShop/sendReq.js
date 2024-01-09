import { Cookie } from "./Cookie.js";

/**
 * @param {Cookie} cookie
 * @param {number} latitude
 * @param {number} longitude
 * @param {number} offset
 * @param {number} pageSize
 * @returns Promise<Response> | boolean
 */
export default async function sendReq(
	cookie,
	latitude = 25.0173405,
	longitude = 121.5397518,
	offset = 0,
	pageSize = 80
) {
	try {
		let ret = await fetch(
			"https://www.ubereats.com/_p/api/getFeedV1?localeCode=tw",
			{
				headers: {
					accept: "*/*",
					"accept-language": "en-US,en;q=0.9",
					"content-type": "application/json",
					"sec-ch-ua": '"Not=A?Brand";v="99", "Chromium";v="118"',
					"sec-ch-ua-mobile": "?0",
					"sec-ch-ua-platform": '"macOS"',
					"sec-fetch-dest": "empty",
					"sec-fetch-mode": "cors",
					"sec-fetch-site": "same-origin",
					"x-csrf-token": "x",
					"x-uber-client-gitref": "0f63884b5b49e841dfaec36bada4d296daf5b047",
					cookie: cookie.gen(latitude, longitude),
				},
				body: JSON.stringify({
					pageInfo: {
						offset: offset,
						pageSize: pageSize,
					},
				}),
				method: "POST",
			}
		);
		console.log(ret.status)
		return ret;
	} catch (e) {
		console.error(e);
	}
	return false;
}

//let cookie = new Cookie();
//let get = await fetch("https://www.ubereats.com/tw/feed?diningMode=DELIVERY");
//cookie.updateCookies(get.headers.getSetCookie().join("; "));
//let response = await sendReq(cookie);
//console.log(response.ok);
//cookie.updateCookies(response.headers.getSetCookie().join("; "));
//response = await sendReq(cookie);
//console.log(response.ok);
