const monsters = [
	{ rarity: 'Bronze', catchRate: 70, encounterRate: 50, color: 0xAF6600, shmoinMulti: 1 },
	{ rarity: 'Silver', catchRate: 40, encounterRate: 30, color: 0xCDCDCD, shmoinMulti: 2 },
	{ rarity: 'Gold', catchRate: 20, encounterRate: 10, color: 0xFFD500, shmoinMulti: 4 },
	{ rarity: 'Diamond', catchRate: 5, encounterRate: 3, color: 0x00E3FF, shmoinMulti: 8 },
];

function fetchMonsterDetails(rarity) {
	rarity = rarity.toString().toLocaleUpperCase();

	switch (rarity) {
	case 'BRONZE':
		return monsters[0];
	case 'SILVER':
		return monsters[1];
	case 'GOLD':
		return monsters[2];
	case 'DIAMOND':
		return monsters[3];
	}
}

module.exports = {
	fetchMonsterDetails,
	monsters,
};