import { getChara } from "../../Chara/Model";
import { GAME_SPEED } from "../../env";
import { INVALID_STATE } from "../../errors";
import { CombatBoardState } from "../Model";

const WALK_DURATION = 500;

export default async function (
  sourceId: string,
  targetId: string,
  { scene, unitSquadIndex, charaIndex, left }: CombatBoardState
) {
  const chara = getChara(sourceId, charaIndex);
  const target = getChara(targetId, charaIndex);

  chara.run();

  const targetSquadId = unitSquadIndex.get(target.unit.id);

  if (!targetSquadId) throw new Error(INVALID_STATE);

  const targetIsLeft = left === targetSquadId;

  return new Promise<void>((resolve) => {
    scene.add.tween({
      targets: chara.container,
      x: target.container.x + (targetIsLeft ? 80 : -80),
      y: target.container.y,
      duration: WALK_DURATION / GAME_SPEED,
      onComplete: () => {
        resolve();
      },
    });
  });
}
