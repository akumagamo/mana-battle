import { MapSquad } from "../../API/Map/Model";
import { Chara } from "../../Chara/Chara";
import { INVALID_STATE } from "../../errors";
import { MapScene } from "../MapScene";

const CHARA_MAP_SCALE = 0.45;

export const renderSquad = (scene: MapScene, squad: MapSquad): void => {
  const { container } = scene.getContainers();
  const squadLeader = Object.values(squad.members).find((mem) => mem.leader);

  if (!squadLeader) throw new Error(INVALID_STATE);

  let leader = scene.state.units.find((_, k) => k === squadLeader.id);

  if (!leader) throw new Error(INVALID_STATE);

  const { x, y } = scene.getCellPositionOnScreen(squad.pos);

  const chara = new Chara(
    scene.charaKey(squad.id),
    scene,
    leader,
    x,
    y,
    CHARA_MAP_SCALE,
    true
  );

  container.add(chara.container);

  scene.charas.push(chara);

  if (scene.movedSquads.includes(squad.id)) chara.container.setAlpha(0.5);
};

export default (scene: MapScene): void => {
  scene.state.mapSquads
    .filter((u) => u.status === "alive")
    .forEach((unit) => renderSquad(scene, unit));
};
