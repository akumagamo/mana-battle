import { getMapSquad, MapSquad, MapState } from '../Model';
import { INVALID_STATE } from '../../errors';
import { PLAYER_FORCE } from '../../constants';
import { CHARA_MAP_SCALE } from '../config';
import createChara from '../../Chara/createChara';
import { addInsignea } from '../../Chara/commands/addInsignea';

export const renderSquad = (
  scene: Phaser.Scene,
  state: MapState,
  mapSquad: MapSquad
): void => {
  const { mapContainer } = state;
  const squadLeader = mapSquad.squad.members.find(
    (mem) => mem.id === mapSquad.squad.leader
  );

  if (!squadLeader) throw new Error(INVALID_STATE);

  let leader = state.units.find((_, k) => k === squadLeader.id);

  if (!leader) throw new Error(INVALID_STATE);

  const { x, y } = mapSquad.pos;

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
};

export default (scene: Phaser.Scene, state: MapState): void => {
  state.dispatchedSquads.forEach((id) =>
    renderSquad(scene, state, getMapSquad(state, id))
  );

  state.squadsInMovement.forEach(async ({ path }, id) => {
    const squad = getMapSquad(state, id);

    // Update reference
    // We need a ref for quick updates in the main loop
    state.squadsInMovement = state.squadsInMovement.set(id, {
      path,
      squad,
    });
  });
};
