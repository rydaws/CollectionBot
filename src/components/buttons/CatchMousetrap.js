const { catchMousetrap } = require('../../commands/catch');
module.exports = {
	data: {
		name: 'catch_mousetrap',
	},
	async execute(interaction) {
		await catchMousetrap(interaction);
	},
};