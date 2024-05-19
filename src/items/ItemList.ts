// Available Shop items
import { mousetrap, net, lasso, beartrap, safe } from "./Traps";
import { luckyshmoin, shmoizberry } from "./Amplifiers";
import { Amplifier, Trap } from "../lib/types/global";

// Array of items that can be found in the shop
const potentialItems = [
	mousetrap, net, lasso, beartrap, safe, luckyshmoin, shmoizberry,
];

/**
 * Refreshes items in shop to only show enabled ones.
 *
 * @returns {*[]} - Array of enabled items
 */
export function refreshItems() {
	return potentialItems.map((item: Trap | Amplifier) => item.enabled);
}

/**
 * Returns item based on name.
 *
 * @param item_name - The name of the items
 * @returns {} - The singular item
 */
export function returnItem(item_name: string) {
	return potentialItems.find(item => item.name === item_name);
}

/**
 * Returns list of all items
 *
 * @returns {[]}
 */
export function getAllItems() {
	return potentialItems;
}

// Exported elements
module.exports = {
	refreshItems,
	returnItem,
	getAllItems,
};
