import { shoot } from "../Skills/shoot";
import { Job } from "./Jobs";

export const archer: Job = {
  id: "archer",
  name: "Archer",
  statsPerLevel: {
    str: 6,
    dex: 4,
    int: 2,
  },
  attacks: {
    front: { times: 1, skill: shoot },
    middle: { times: 1, skill: shoot },
    back: { times: 2, skill: shoot },
  },
  equips: {
    head: "helm",
    mainHand: "sword",
    offHand: "shield",
    chest: "heavy_armor",
    ornament: "accessory",
  },
};
