import { List } from "immutable";
import { SquadIndex } from "../Squad/Model";
import { Unit, UnitIndex } from "../Unit/Model";

export type CombatCreateParams = {
  left: string; // TODO: change to Squad
  right: string;
  squads: SquadIndex;
  units: UnitIndex;
  onCombatFinish: (cmd: List<Unit>, squadDamage: Map<string, number>) => void;
};
