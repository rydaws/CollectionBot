function getItemChoices() {
	// TODO doesn't work, how do we return comma seperated list?

	return { name: 'Mouseitem', value: 'mouseitem' },
	{ name: 'Net', value: 'net' },
	{ name: 'Lasso', value: 'lasso' },
	{ name: 'Bearitem', value: 'bearitem' },
	{ name: 'Safe', value: 'safe' },
	{ name: 'Lucky Shmoin', value: 'luckyshmoin' },
	{ name: 'Shmoizberry', value: 'shmoizberry' };
}

module.exports = {
	getItemChoices,
};