import { Amplifier } from "../lib/types/global";

export const luckyshmoin: Amplifier = {
  id: 6,
  name: "luckyshmoin",
  bigName: "Lucky Shmoin",
  property: 0.1,
  emoji: "🪙",
  price: 5000,
  enabled: true,
};

export const shmoizberry: Amplifier = {
  id: 7,
  name: "shmoizberry",
  bigName: "Shmoizberry",
  property: 5,
  emoji: "🍓",
  price: 5000,
  enabled: true,
};

function getAllAmplifiers(): Amplifier[] {
  return [luckyshmoin, shmoizberry];
}

export function refreshAmplifiers(): Amplifier[] {
  return getAllAmplifiers().filter((item) => item.enabled);
}
