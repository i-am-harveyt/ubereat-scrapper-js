/**
 * Generates a menu object from the given data.
 *
 * @param {object} data - The data to extract the menu from.
 * @return {object} - The generated menu object.
 */
export default function getMenuData(data) {
  const menu = extractMenu(data.catalogSectionsMap);
  let result = {
    uuid: [],
    product: [],
    description: [],
    price: [],
    isSoldOut: [],
  };
  for (const item of menu) {
    result.uuid.push(item.uuid ? item.uuid : NaN);
    result.product.push(item.title ? item.title : NaN);
    result.description.push(item.itemDescription ? item.itemDescription : NaN);
    result.price.push(item.price ? item.price / 100 : NaN);
    result.isSoldOut.push(
      typeof item.isSoldOut === "boolean" ? item.isSoldOut : NaN,
    );
  }
  return result;
}

/**
 * This function will extract the menu from the "catalogSectionsMap"
 *
 * @param {object} catalogSectionsMap
 * @return {Array}
 */
function extractMenu(catalogSectionsMap) {
  const sections = Object.values(catalogSectionsMap);
  let menuItems = [];
  for (const section of sections) menuItems.push(...extractItems(section));
  return menuItems.flat();
}

/*
 * Note: if the section's type is "HORIZONTAL_GRID", it may be popular items
 */

/**
 *
 * @param {Array<Object>} section
 */
function extractItems(section) {
  return section.map((e) => Object.values(e.payload)[0].catalogItems);
}
