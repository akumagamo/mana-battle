import { CharaIndex, getChara } from "../../Chara/Model";
import { GAME_SPEED } from "../../env";
import {
  getSquadMember,
  getUnitSquad,
  SquadIndex,
  UnitSquadIndex,
} from "../../Squad/Model";
import { placeUnitOnBoard } from "../combatBoard";

const WALK_DURATION = 500;

export default function (
  id: string,
  {
    scene,
    charaIndex,
    squadIndex,
    unitSquadIndex,
    left,
  }: {
    scene: Phaser.Scene;
    charaIndex: CharaIndex;
    squadIndex: SquadIndex;
    unitSquadIndex: UnitSquadIndex;
    left: string;
  }
) {
  const chara = getChara(id, charaIndex);

  chara.run();

  const squad = getUnitSquad(chara.id, squadIndex, unitSquadIndex);
  const isLeft = left === squad.id;

  const member = getSquadMember(squad.id, id, squadIndex);

  const position = placeUnitOnBoard(isLeft)(squad)(member.id);

  return new Promise<void>((resolve) => {
    scene.tweens.add({
      targets: chara.container,
      ...position,
      duration: WALK_DURATION / GAME_SPEED,
      onComplete: () => {
        chara.stand();
        resolve();
      },
    });
  });
}
