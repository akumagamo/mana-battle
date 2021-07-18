import { getChara, getMapSquad, MapSquad, MapState } from "../Model";
import { INVALID_STATE } from "../../errors";
import { PLAYER_FORCE } from "../../constants";
import { CHARA_MAP_SCALE } from "../config";
import createChara from "../../Chara/createChara";
import { addInsignea } from "../../Chara/commands/addInsignea";
import { Chara } from "../../Chara/Model";
import animateSquadRun from "../squads/animateSquadRun";

export const renderSquad = (
  scene: Phaser.Scene,
  state: MapState,
  mapSquad: MapSquad
): Chara => {
  const { mapContainer } = state;
  const squadLeader = mapSquad.squad.members.find(
    (mem) => mem.id === mapSquad.squad.leader
  );

  if (!squadLeader) throw new Error(INVALID_STATE);

  let leader = state.units.find((_, k) => k === squadLeader.id);

  if (!leader) throw new Error(INVALID_STATE);

  const { x, y } = mapSquad.posScreen;

  const chara = createChara({
    scene: scene,
    unit: leader,
    x,
    y,
    scale: CHARA_MAP_SCALE,
  });

  addInsignea(chara);

  mapContainer.add(chara.container);

  state.charas.push(chara);

  return chara;
};

export default (scene: Phaser.Scene, state: MapState): void => {
  state.dispatchedSquads.forEach((id) =>
    renderSquad(scene, state, getMapSquad(state, id))
  );

  state.squadsInMovement.forEach(async ({ path }, id) => {
    const squad = getMapSquad(state, id);

    const chara = getChara(state, id);
    animateSquadRun(chara);

    state.squadsInMovement = state.squadsInMovement.set(id, {
      path,
      squad,
    });
  });
};
