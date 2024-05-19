import { EmbedBuilder, User } from "discord.js";
// @ts-ignore
import { fetchMonsterDetails } from "../monsters/MonsterDetails";

export function monsterEmbed(user: User, res: any) {
	console.log('[DisplayMonster] Starts embed build');
	const name = res.rows[0].display_name;
	const className = res.rows[0].class;
	const type = res.rows[0].type;
	const rarity = res.rows[0].rarity;
	const img = res.rows[0].img;

	return new EmbedBuilder()
		.setColor(fetchMonsterDetails(rarity)?.color!)
		.setTitle('Monster')
		.setAuthor({ name: user.username, iconURL: user.avatarURL()! })
		.setDescription('Stats for the monster')
		.setThumbnail(img)
		.addFields(
			{ name: 'Name', value: `${name}`, inline: true },
			{ name: 'Class', value: `${className}`, inline: true },
			{ name: 'Type', value: `${type}`, inline: true },
			{ name: 'Rarity', value: `${rarity}`, inline: true },
		)
		.setTimestamp();
}

export function showMonsterEmbed(user: User, res: any, level: number) {
	console.log('[DisplayMonster] Starts showMonsterEmbed build');
	const name = res.rows[0].display_name;
	const className = res.rows[0].class;
	const type = res.rows[0].type;
	const rarity = res.rows[0].rarity;
	const img = res.rows[0].img;

	return new EmbedBuilder()
		.setTitle(`${name}`)
		// .setAuthor({ name: user.username, iconURL: user.avatarURL() })
		.setDescription(`Owned by ${user.username}`)
		.addFields(
			{ name: 'Level', value: `${level}`, inline: true },
			{ name: 'Class', value: `${className}`, inline: true },
			{ name: 'Type', value: `${type}`, inline: true },
			{ name: 'Rarity', value: `${rarity}`, inline: true },
			// TODO maybe change to include 'Obtained: TIME'
		)
		.setImage(img)
		.setColor(fetchMonsterDetails(rarity)?.color || 0x333333)
		.setTimestamp()
		.setFooter({ text: `Owned by: ${user.username}`, iconURL: user.avatarURL()! });
	// TODO maybe do OBTAINED AT
}

export function runaway(user: User, res: any) {
	console.log('[RunAwayEmbed] Monster ran away');
	const name = res.rows[0].display_name;
	const className = res.rows[0].class;
	const type = res.rows[0].type;
	const rarity = res.rows[0].rarity;
	const img = res.rows[0].img;

	return new EmbedBuilder()
		.setColor(0x000000)
		.setAuthor({ name: 'The Monster ran away!', iconURL: 'https://collection-monsters.s3.amazonaws.com/runaway.png' })
		.setDescription(`**${name}** ran away, ${user.username}!`)
		.addFields(
			{ name: 'Class', value: `${className}`, inline: true },
			{ name: 'Type', value: `${type}`, inline: true },
			{ name: 'Rarity', value: `${rarity}`, inline: true },

		)
		.setThumbnail(img);
}

export function badCatch(user: User, res: any) {
	console.log('[BadCatchEmbed] Monster broke free and ran away');
	const name = res.rows[0].display_name;
	const className = res.rows[0].class;
	const type = res.rows[0].type;
	const rarity = res.rows[0].rarity;
	const img = res.rows[0].img;

	return new EmbedBuilder()
		.setColor(0xC70039)
		.setAuthor({ name: 'The Monster broke free!!', iconURL: 'https://collection-monsters.s3.amazonaws.com/breakout.png' })
		.setDescription(`**${name}** broke free and ran away, ${user.username}!`)
		.addFields(
			{ name: 'Class', value: `${className}`, inline: true },
			{ name: 'Type', value: `${type}`, inline: true },
			{ name: 'Rarity', value: `${rarity}`, inline: true },

		)
		.setThumbnail(img);
}

export function successCatch(user: User, res: any, shmoinsToAdd: number) {
	console.log(`[SuccessCatchEmbed] Monster was caught and added to ${user.username}'s inventory!`);
	const name = res.rows[0].display_name;
	const className = res.rows[0].class;
	const type = res.rows[0].type;
	const rarity = res.rows[0].rarity;
	const img = res.rows[0].img;

	return new EmbedBuilder()
		.setColor(0x32CD32)
		.setAuthor({ name: 'You caught the Monster!', iconURL: 'https://collection-monsters.s3.amazonaws.com/success.png' })
		.setDescription(`**${name}** was added to your box, ${user.username}!\n\nAlso you earned **${shmoinsToAdd}** Shmoins!`)
		.addFields(
			{ name: 'Class', value: `${className}`, inline: true },
			{ name: 'Type', value: `${type}`, inline: true },
			{ name: 'Rarity', value: `${rarity}`, inline: true },

		)
		.setThumbnail(img);
}

export function catchEmbed(user: User, res: any) {
	console.log('[CatchEmbed] Starting catch game display...');
	const name = res.rows[0].display_name;
	const className = res.rows[0].class;
	const type = res.rows[0].type;
	const rarity = res.rows[0].rarity;
	const img = res.rows[0].img;

	return new EmbedBuilder()
		.setColor(fetchMonsterDetails(rarity)?.color || 0x333333)
		.setAuthor({ name: 'A Monster appeared!', iconURL: 'https://collection-monsters.s3.amazonaws.com/tallgrass.png' })
		.setDescription(`**${user.username}** found a wild **${name}!**`)
		.setThumbnail(img)
		.addFields(
			{ name: 'Name', value: `${name}`, inline: true },
			{ name: 'Class', value: `${className}`, inline: true },
			{ name: 'Type', value: `${type}`, inline: true },
			{ name: 'Rarity', value: `${rarity}`, inline: true },
		)
		.setFooter({ text: 'Click any of the options below to try and catch it!' })
		.setTimestamp();
}

export function errorEmbed(description: string) {
	return new EmbedBuilder()
		.setColor(0xFE514E)
		.setTitle('Error')
		.setDescription(description)
		.setTimestamp();
}

export function textEmbed(description: string) {
	return new EmbedBuilder()
		.setColor(0x0099FF)
		.setTitle('Information')
		.setDescription(description)
		.setTimestamp();
}

module.exports = {
	monsterEmbed,
	showMonsterEmbed,
	runaway,
	catchEmbed,
	badCatch,
	successCatch,
	errorEmbed,
	textEmbed,
};
