const { updatePages } = require('../../commands/ViewBox');
module.exports = {
	data: {
		name: 'last_page',
	},
	async execute(interaction) {
		// await interaction.update({
		// 	content: 'it works',
		// 	components: [],
		// 	embed: [],
		// });
		await updatePages(interaction);
	},
};