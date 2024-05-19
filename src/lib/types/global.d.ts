export interface Amplifier {
  id: number,
  name: string,
  bigName: string,
  property: number,
  emoji: string,
  price: number,
  enabled: boolean,
}

export interface Trap {
  id: number,
  name: string,
  bigName: string,
  emoji: string,
  catchRate: number,
  price: number,
  enabled: boolean,
}

export interface MonsterStatistics {
  rarity: string,
  catchRate: number,
  encounterRate: number
  color: number,
  shmoinMulti: number
}