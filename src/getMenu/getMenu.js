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
  longitude,
) {
  // delay
  await new Promise((resolve) => setTimeout(resolve, Math.random() * 2000));
  let get = await fetch("https://www.ubereats.com/tw/feed?diningMode=DELIVERY");
  cookie.updateCookies(get.headers.getSetCookie().join("; "));
  cookie.setCookie("mcd_restaurant", "");

  let now = new Date();

  // fetch logic
  let response = await sendReqMenu(cookie, shopUuid, latitude, longitude);
  let jsonPath = `../../../uber_data/uber_menu/json/`;
  mkdirSync(jsonPath, { recursive: true });
  // writeFileSync(
  // 	`${jsonPath}/${shopUuid}.json`,
  // 	JSON.stringify(await response.json())
  // );

  // data conversion
  return extractData((await response.json()).data, now, latitude, longitude);
}
