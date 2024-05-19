// Amplifiers
import { Amplifier } from "../lib/types/global";

export const luckyshmoin: Amplifier = {
	id: 6,
	name: 'luckyshmoin',
	bigName: 'Lucky Shmoin',
	property: 0.10,
	emoji: '🪙',
	price: 5000,
	enabled: true
};

export const shmoizberry: Amplifier = {
	id: 7,
	name: 'shmoizberry',
	bigName: 'Shmoizberry',
	property: 5,
	emoji: '🍓',
	price: 5000,
	enabled: true
};


/**
 * Return list of all amplifiers
 *
 * @returns {[]} Array of items.
 */
function getAllAmplifiers() {
	return [luckyshmoin, shmoizberry];
}

/**
 * Refreshes active amplifiers.
 *
 * @returns {Amplifier[]} Array of active items.
 */
export function refreshAmplifiers() {
	return getAllAmplifiers().filter((item: Amplifier) => item.enabled);
}
