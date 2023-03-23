const luckyshmoin = { id: 6, name: 'luckyshmoin', property: 0.10, emoji: '🪙', price: 5000, enabled: true };
const shmoizberry = { id: 7, name: 'schmoizberry', property: 10, emoji: '🍓', price: 5000, enabled: true };

function getAmplifier(item_name) {
	item_name = item_name.toString().toLowerCase();

	switch (item_name) {
	case 'luckyshmoin':
		return luckyshmoin;
	case 'shmoizberry':
		return shmoizberry;
	}
}

function getAllAmplifiers() {
	return [luckyshmoin, shmoizberry];
}

module.exports = {
	getAmplifier,
	getAllAmplifiers,
	luckyshmoin,
	shmoizberry,
};