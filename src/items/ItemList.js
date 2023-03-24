const { mousetrap, net, lasso, beartrap, safe } = require('./Traps');
const { luckyshmoin, shmoizberry } = require('./Amplifiers');

const potentialItems = [
	mousetrap, net, lasso, beartrap, safe, luckyshmoin, shmoizberry,
];

let itemList = [];

function refreshItems() {
	itemList = [];
	potentialItems.forEach((item) => {
		if (item.enabled) {
			itemList.push(item);
		}
	});
	return itemList;
}

function returnItem(item_name) {
	return potentialItems.find(item => item.name === item_name);
}

function getAllItems() {
	return potentialItems;
}

module.exports = {
	refreshItems,
	returnItem,
	getAllItems,
};
