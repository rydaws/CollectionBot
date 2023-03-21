const { catchAttempt } = require('../../commands/catch');
const { mousetrap } = require('../../shop/Traps');
module.exports = {
	data: {
		name: 'catch_mousetrap',
	},
	async execute(interaction) {
		await catchAttempt(interaction, mousetrap);
	},
};