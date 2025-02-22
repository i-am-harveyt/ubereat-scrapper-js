const { DataFrame } = require("nodejs-polars");

export default function getStoreInfo(restaurant) {
  // 創建結果數據框
  let result = {
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
  };
  const today = new Date();
  result.updateDate.push(today.toISOString());
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
  result.serviceFee.push(restaurant.tracking.storePayload.fareInfo.serviceFee);
  result.latitude.push(restaurant.mapMarker.latitude);
  result.longitude.push(restaurant.mapMarker.longitude);
  return DataFrame(result);
}
