import { MapSquad } from "../Model";
import { Chara } from "../../Chara/Chara";
import { INVALID_STATE } from "../../errors";
import { MapScene } from "../MapScene";
import { PLAYER_FORCE } from "../../constants";

const CHARA_MAP_SCALE = 0.45;

export const renderSquad = (scene: MapScene, mapSquad: MapSquad): void => {
  const { container } = scene.getContainers();
  const squadLeader = mapSquad.squad.members.find(
    (mem) => mem.id === mapSquad.squad.leader
  );

  if (!squadLeader) throw new Error(INVALID_STATE);

  let leader = scene.state.units.find((_, k) => k === squadLeader.id);

  if (!leader) throw new Error(INVALID_STATE);

  const { x, y } = scene.getCellPositionOnScreen(mapSquad.pos);

  const chara = new Chara(
    scene.charaKey(mapSquad.squad.id),
    scene,
    leader,
    x,
    y,
    CHARA_MAP_SCALE,
    true
  );

  const emblem = chara.add.image(
    100,
    -20,
    mapSquad.squad.force === PLAYER_FORCE ? "ally_emblem" : "enemy_emblem"
  );

  chara.container.add(emblem);

  container.add(chara.container);

  scene.charas.push(chara);
};

export default (scene: MapScene): void => {
  scene.state.dispatchedSquads.forEach((id) =>
    renderSquad(scene, scene.getSquad(id))
  );
};
