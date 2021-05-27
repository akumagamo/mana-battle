import { MapSquad } from "../Model";
import { Chara } from "../../Chara/Chara";
import { INVALID_STATE } from "../../errors";
import { MapScene } from "../MapScene";
import { PLAYER_FORCE } from "../../constants";
import { CHARA_MAP_SCALE } from "../config";

export const renderSquad = (scene: MapScene, mapSquad: MapSquad): void => {
  const { container } = scene.getContainers();
  const squadLeader = mapSquad.squad.members.find(
    (mem) => mem.id === mapSquad.squad.leader
  );

  if (!squadLeader) throw new Error(INVALID_STATE);

  let leader = scene.state.units.find((_, k) => k === squadLeader.id);

  if (!leader) throw new Error(INVALID_STATE);

  const { x, y } = mapSquad.pos;

  const key = scene.charaKey(mapSquad.squad.id)

  const chara = new Chara({
    key,
    parent: scene,
    unit: leader,
    cx: x,
    cy: y,
    scaleSizing: CHARA_MAP_SCALE,
    showWeapon: false
  });

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

  scene.squadsInMovement.forEach(async ({ path }, id) => {
    const squad = scene.getSquad(id);

    // Update reference
    // We need a ref for quick updates in the main loop
    scene.squadsInMovement = scene.squadsInMovement.set(id, {
      path,
      squad,
    });
  });
};
