const luckyshmoin = { id: 6, name: 'luckyshmoin', bigName: 'Lucky Shmoin', property: 0.10, emoji: '🪙', price: 5000, enabled: true };
const shmoizberry = { id: 7, name: 'shmoizberry', bigName: 'Shmoizberry', property: 5, emoji: '🍓', price: 5000, enabled: true };

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

function refreshAmplifiers() {
	const itemList = [];
	getAllAmplifiers().forEach((item) => {
		if (item.enabled) {
			itemList.push(item);
		}
	});
	return itemList;
}

module.exports = {
	getAmplifier,
	getAllAmplifiers,
	refreshAmplifiers,
	luckyshmoin,
	shmoizberry,
};