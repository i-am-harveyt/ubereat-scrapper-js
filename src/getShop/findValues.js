export default function findValues(d, key) {
    /**
     * 遍歷物件 d 中的所有欄位，找出所有指定 key 的值
     */
    const values = [];

    function recursiveFind(obj) {
        for (const k in obj) {
            if (k === key) {
                values.push(obj[k]);
            } else if (typeof obj[k] === "object" && obj[k] !== null) {
                recursiveFind(obj[k]);
                // 在物件中遞迴搜尋名為 'location' 的鍵
                if ("location" in obj[k]) {
                    recursiveFind(obj[k].location);
                }
            } else if (Array.isArray(obj[k])) {
                for (const item of obj[k]) {
                    if (typeof item === "object" && item !== null) {
                        recursiveFind(item);
                    }
                }
            }
        }
    }

    recursiveFind(d);
    return values;
}
