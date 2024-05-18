const { lastPage } = require('../../slashCommands/ViewBox');
module.exports = {
	data: {
		name: 'last_page',
	},
	async execute(interaction) {
		await lastPage(interaction);
	},
};