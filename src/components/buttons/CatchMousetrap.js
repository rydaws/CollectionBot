const { catchAttempt } = require('../../commands/catch');
const { mousetrap } = require('../../items/Traps');
module.exports = {
	data: {
		name: 'catch_mousetrap',
	},
	async execute(interaction) {
		await catchAttempt(interaction, mousetrap);
	},
};