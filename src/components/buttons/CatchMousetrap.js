const { catchAttempt } = require('../../commands/catch');
const { mousetrap } = require('../../shop/CatchingGear');
module.exports = {
	data: {
		name: 'catch_mousetrap',
	},
	async execute(interaction) {
		await catchAttempt(interaction, mousetrap);
	},
};