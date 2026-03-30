import { mousetrap, net, lasso, beartrap, safe } from "./Traps";
import { luckyshmoin, shmoizberry } from "./Amplifiers";
import { Amplifier, Trap } from "../lib/types/global";

const potentialItems: (Trap | Amplifier)[] = [mousetrap, net, lasso, beartrap, safe, luckyshmoin, shmoizberry];

export function refreshItems() {
  return potentialItems.map((item) => item.enabled);
}

export function returnItem(item_name: string): Trap | Amplifier | undefined {
  return potentialItems.find((item) => item.name === item_name);
}

export function getAllItems(): (Trap | Amplifier)[] {
  return potentialItems;
}
