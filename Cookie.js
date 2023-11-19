import { readFileSync, writeFileSync } from "fs";

export class Cookie {
	cookies = {}; // The container
	keys = [
		"dId",
		"uev2.diningMode",
		"marketing_vistor_id",
		"uev2.gg",
		"CONSENTMGR",
		"uev2.id.xp",
		"uev2.id.session",
		"uev2.ts.session",
		"utm_medium",
		"fm_conversion_id",
		"utm_source",
		"_userUuid",
		"utag_main",
		"jwt-session",
	];
	init() {
		//    for (let key in this.keys)
		//      this.cookies[key] = this.getCookie(key);
	}

	/**
	 * @param {string} cookieString
	 * @returns Object
	 */
	updateCookies(cookieString) {
		// 將字符串分割成Cookie部分
		const cookieSplit = cookieString.split("; ");

		let skipWords = ["expires", "path", "domain", "secure", "httponly"];

		// 遍歷每個Cookie部分並解析成對象
		cookieSplit.forEach((cookie) => {
			let [name, value] = cookie.split("=");
			if (!skipWords.includes(name)) {
				value = `${name}=${value};`;

				// update
				this.cookies[name] = value;

				// write into static files
				this.writeCookie(name, value);
			}
		});
		return this.cookies;
	}

	/**
	 * call this to set value to key
	 * @param {string} key
	 * @param {string} value
	 */
	writeCookie(key, value) {
		try {
			writeFileSync(`./cookies/${key}.txt`, value);
		} catch (err) {
			console.error(err);
		}
	}

	/**
	 * return the value of the key
	 * @param {string} key
	 * @returns string
	 */
	getCookie(key) {
		try {
			return readFileSync(`./cookies/${key}.txt`, "utf8").trim();
		} catch (e) {
			// console.error(e);
			return "";
		}
	}

	/**
	 * generate the cookie with latitude and longitude
	 * @param {number} latitude
	 * @param {number} longitude
	 * @returns string
	 */
	gen(latitude, longitude) {
		// 製造cookie
		const locatCookie = {
			address: {
				address1: "",
				address2: "",
				aptOrSuite: "",
				eaterFormattedAddress: "",
				subtitle: "",
				title: "",
				uuid: "",
			},
			latitude: latitude,
			longitude: longitude,
			reference: "",
			referenceType: "google_places",
			type: "google_places",
			addressComponents: {
				city: "",
				countryCode: "TW",
				firstLevelSubdivisionCode: "",
				postalCode: "",
			},
			categories: ["establishment", "point_of_interest"],
			originType: "user_autocomplete",
			source: "manual_auto_complete",
		};
		const json_str = JSON.stringify(locatCookie); // 將物件轉換為 JSON 字串
		const url_encoded_str = encodeURIComponent(json_str); // 再轉換成 URL encode 的格式
		const ret =
			`uev2.loc=${url_encoded_str};` + Object.values(this.cookies).join(" ");
		return ret;
	}
}
