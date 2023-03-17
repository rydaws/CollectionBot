const { mousetrap, net, lasso, safe, beartrap } = require('./CatchingGear');

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

module.exports = {
	refreshItems,
};
