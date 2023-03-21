const { mousetrap, net, lasso, beartrap, safe } = require('./Traps');

const potentialItems = [
	mousetrap, net, lasso, beartrap, safe,
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

function getAllItems() {
	return potentialItems;
}

module.exports = {
	refreshItems,
	getAllItems,
};
