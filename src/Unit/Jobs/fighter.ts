import { slash } from "../Skills/slash";
import { Job } from "./Jobs";

export const fighter: Job = {
  id: "fighter",
  name: "Fighter",
  statsPerLevel: {
    str: 6,
    dex: 4,
    int: 2,
  },
  attacks: {
    front: { times: 2, skill: slash },
    middle: { times: 1, skill: slash },
    back: { times: 1, skill: slash },
  },
  equips: {
    head: "helm",
    mainHand: "sword",
    offHand: "shield",
    chest: "heavy_armor",
    ornament: "accessory",
  },
};
