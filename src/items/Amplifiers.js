// Amplifiers
const luckyshmoin = { id: 6, name: 'luckyshmoin', bigName: 'Lucky Shmoin', property: 0.10, emoji: '🪙', price: 5000, enabled: true };
const shmoizberry = { id: 7, name: 'shmoizberry', bigName: 'Shmoizberry', property: 5, emoji: '🍓', price: 5000, enabled: true };

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
 * @returns {[]} Array of active items.
 */
function refreshAmplifiers() {
	const itemList = [];
	getAllAmplifiers().forEach((item) => {
		if (item.enabled) {
			itemList.push(item);
		}
	});
	return itemList;
}

// Exported elements
module.exports = {
	refreshAmplifiers,
	luckyshmoin,
	shmoizberry,
};