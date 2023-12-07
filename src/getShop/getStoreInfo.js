const { DataFrame, toDateTime } = require("danfojs-node");

export default function getStoreInfo(restaurant) {
    // 創建結果數據框
    let result = new DataFrame({
        updateDate: [],
        storeUuid: [],
        shopName: [],
        rating: [],
        actionUrl: [],
        discount: [],
        isOrderable: [],
        serviceFee: [],
        latitude: [],
        longitude: [],
    });
    result.updateDate.push(toDateTime(new Date()));
    result.storeUuid.push(restaurant.storeUuid);
    result.shopName.push(restaurant.title.text);

    try {
        result.rating.push(parseFloat(restaurant.rating.text));
    } catch (error) {
        result.rating.push("");
    }

    result.actionUrl.push(restaurant.actionUrl);

    const discounts = [];
    try {
        for (const signpost of restaurant.signposts) {
            discounts.push(signpost.text);
        }
        result.discount.push(discounts);
    } catch (error) {
        result.discount.push("");
    }

    result.isOrderable.push(restaurant.tracking.storePayload.isOrderable);
    result.serviceFee.push(
        restaurant.tracking.storePayload.fareInfo.serviceFee
    );
    result.latitude.push(restaurant.mapMarker.latitude);
    result.longitude.push(restaurant.mapMarker.longitude);
    return result
}
