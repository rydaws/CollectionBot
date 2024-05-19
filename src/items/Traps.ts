// Trap objects
import { Trap } from "../lib/types/global";

export const mousetrap: Trap = {
	id: 1,
	name: 'mousetrap',
	bigName: 'Mousetrap',
	emoji: '<:mousetrap:1082044930677031032>', catchRate: 10,
	price: 100,
	enabled: true
};

export const net: Trap = {
	id: 2,
	name: 'net',
	bigName: 'Net',
	catchRate: 25,
	emoji: '2️⃣',
	price: 250,
	enabled: true
};

export const lasso: Trap = {
	id: 3,
	name: 'lasso',
	bigName: 'Lasso',
	catchRate: 35,
	emoji: '3️⃣',
	price: 500,
	enabled: true
};

export const beartrap: Trap = {
	id: 4,
	name: 'beartrap',
	bigName: 'Beartrap',
	catchRate: 50,
	emoji: '4️⃣',
	price: 2500,
	enabled: true
};

export const safe: Trap = {
	id: 5,
	name: 'safe',
	bigName: 'Safe',
	catchRate: 100,
	emoji: '<:safe:1089270554369994933>',
	price: 10000,
	enabled: true
};

/**
 * Gets all trap objects
 *
 * @returns {{catchRate: number, bigName: string, emoji: string, price: number, name: string, id: number, enabled: boolean}[]} - Array of all trap objects
 */
function getAllTraps() {
	return [mousetrap, net, lasso, beartrap, safe];
}

/**
 * Refreshes active Traps.
 *
 * @returns {[]} Array of active items.
 */
export function refreshTraps() {
	return getAllTraps().filter((item: Trap) => item.enabled);
}

// Exported elements
module.exports = {
	refreshTraps,
	mousetrap,
	net,
	lasso,
	beartrap,
	safe,
};