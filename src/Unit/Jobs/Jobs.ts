import { ItemSlot, ItemType } from "../../Item/Model";
import { UnitJobs } from "../Model";
import { Skill } from "../Skills/Skills";
import { archer } from "./archer";
import { fighter } from "./fighter";
import { mage } from "./mage";

export type Job = {
  id: string;
  name: string;
  statsPerLevel: {
    str: number;
    dex: number;
    int: number;
  };
  attacks: {
    front: { times: number; skill: Skill };
    middle: { times: number; skill: Skill };
    back: { times: number; skill: Skill };
  };
  equips: {
    [x in ItemSlot]: ItemType;
  };
};

export const JOBS = {
  fighter: fighter,
  archer: archer,
  mage: mage,
};

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
