// Available Shop items
const { mousetrap, net, lasso, beartrap, safe } = require('./Traps');
const { luckyshmoin, shmoizberry } = require('./Amplifiers');

let itemList = [];

// Array of items that can be found in the shop
const potentialItems = [
	mousetrap, net, lasso, beartrap, safe, luckyshmoin, shmoizberry,
];

/**
 * Refreshes items in shop to only show enabled ones.
 *
 * @returns {*[]} - Array of enabled items
 */
function refreshItems() {
	itemList = [];
	potentialItems.forEach((item) => {
		if (item.enabled) {
			itemList.push(item);
		}
	});
	return itemList;
}

/**
 * Returns item based on name.
 *
 * @param item_name - The name of the items
 * @returns {{catchRate: number, bigName: string, emoji: string, price: number, name: string, id: number, enabled: boolean}} - The singular item
 */
function returnItem(item_name) {
	return potentialItems.find(item => item.name === item_name);
}

/**
 * Returns list of all items
 *
 * @returns {{catchRate: number, bigName: string, emoji: string, price: number, name: string, id: number, enabled: boolean}[]}
 */
function getAllItems() {
	return potentialItems;
}

// Exported elements
module.exports = {
	refreshItems,
	returnItem,
	getAllItems,
};
