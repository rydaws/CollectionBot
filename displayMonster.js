const { EmbedBuilder } = require('discord.js');
function buildEmbed(user, res) {
	console.log('Starts embed build');
	const name = res.rows[0].display_name;
	const className = res.rows[0].class;
	const type = res.rows[0].type;
	const rarity = res.rows[0].rarity;
	const img = res.rows[0].img;

	return new EmbedBuilder()
		.setColor(0x0099FF)
		.setTitle('Monster')
		.setAuthor({ name: user.username, iconURL: user.avatarURL() })
		.setDescription('Stats for the monster')
		.setThumbnail(img)
		.addFields(
			{ name: 'Name', value: `${name}`, inline: true },
			{ name: 'Class', value: `${className}`, inline: true },
			{ name: 'Type', value: `${type}`, inline: true },
			{ name: 'Rarity', value: `${rarity}`, inline: true },
		)
		// .setImage('https://collection-monsters.s3.amazonaws.com/the-dogAvatar.png')
		.setTimestamp()
		.setFooter({ text: 'Click options below to capture!' });
}

module.exports = {
	buildEmbed,
};
