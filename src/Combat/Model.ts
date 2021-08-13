import { List } from "immutable";
import { CharaIndex } from "../Chara/Model";
import { SquadIndex, UnitSquadIndex } from "../Squad/Model";
import { Unit, UnitIndex } from "../Unit/Model";

export type CombatCreateParams = {
  left: string; // TODO: change to Squad
  right: string;
  squads: SquadIndex;
  units: UnitIndex;
  onCombatFinish: (cmd: List<Unit>, squadDamage: Map<string, number>) => void;
};

export type CombatBoardState = {
  scene: Phaser.Scene;
  left: string;
  squadIndex: SquadIndex;
  unitIndex: UnitIndex;
  unitSquadIndex: UnitSquadIndex;
  charaIndex: CharaIndex;
};
