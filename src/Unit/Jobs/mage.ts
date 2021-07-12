import { fireball } from "../Skills/fireball";
import { Job } from "./Jobs";

export const mage: Job = {
  id: "mage",
  name: "Mage",
  statsPerLevel: {
    str: 6,
    dex: 4,
    int: 2,
  },
  attacks: {
    front: { times: 1, skill: fireball },
    middle: { times: 1, skill: fireball },
    back: { times: 2, skill: fireball },
  },
  equips: {
    head: "helm",
    mainHand: "sword",
    offHand: "shield",
    chest: "heavy_armor",
    ornament: "accessory",
  },
};
