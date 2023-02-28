const { lastPage } = require('../../commands/ViewBox');
module.exports = {
	data: {
		name: 'last_page',
	},
	async execute(interaction) {
		await lastPage(interaction);
	},
};