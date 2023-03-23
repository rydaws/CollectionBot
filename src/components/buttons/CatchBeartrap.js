const { catchAttempt } = require('../../commands/catch');
const { beartrap } = require('../../items/Traps');
module.exports = {
	data: {
		name: 'catch_beartrap',
	},
	async execute(interaction) {
		await catchAttempt(interaction, beartrap);
	},
};