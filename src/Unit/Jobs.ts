import {UnitJobs} from "./Model";

export const baseEquips = {
  mage: {
    ornament: "amulet",
    chest: "robe",
    mainHand: "oaken_staff",
    offHand: "none",
    head: "wiz_hat",
  },
  fighter: {
    ornament: "amulet",
    chest: "iron_armor",
    mainHand: "iron_sword",
    offHand: "iron_shield",
    head: "iron_helm",
  },
  archer: {
    ornament: "amulet",
    chest: "leather_armor",
    mainHand: "bow",
    offHand: "none",
    head: "archer_hat",
  },
};

export const classes: UnitJobs[] = ["fighter", "mage", "archer"];
export const classLabels: { [label in UnitJobs]: string } = {
  fighter: "Fighter",
  mage: "Mage",
  archer: "Archer",
};

