// Trap objects
const mousetrap = { id: 1, name: 'mousetrap', bigName: 'Mousetrap', emoji: '<:mousetrap:1082044930677031032>', catchRate: 10, price: 100, enabled: true };
const net = { id: 2, name: 'net', bigName: 'Net', catchRate: 25, emoji: '2️⃣', price: 250, enabled: true };
const lasso = { id: 3, name: 'lasso', bigName: 'Lasso', catchRate: 35, emoji: '3️⃣', price: 500, enabled: true };
const beartrap = { id: 4, name: 'beartrap', bigName: 'Beartrap', catchRate: 50, emoji: '4️⃣', price: 2500, enabled: true };
const safe = { id: 5, name: 'safe', bigName: 'Safe', catchRate: 100, emoji: '<:safe:1089270554369994933>', price: 10000, enabled: true };

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
function refreshTraps() {
	const itemList = [];
	getAllTraps().forEach((item) => {
		if (item.enabled) {
			itemList.push(item);
		}
	});
	return itemList;
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