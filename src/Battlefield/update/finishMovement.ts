import { Vector } from 'matter';
import stand from '../../Chara/animations/stand';
import { PLAYER_FORCE } from '../../constants';
import { screenToCellPosition } from '../board/position';
import SquadArrivedInfoMessageCompleted from '../events/SquadArrivedInfoMessageCompleted';
import { getChara, MapSquad, MapState } from '../Model';
import speak from '../rendering/speak';

export default async function (
  scene: Phaser.Scene,
  state: MapState,
  path: Vector[],
  squad: MapSquad
) {
  const [, ...remaining] = path;

  if (remaining.length > 0) {
    state.squadsInMovement = state.squadsInMovement.set(squad.id, {
      path: remaining,
      squad,
    });
  } else {
    state.squadsInMovement = state.squadsInMovement.delete(squad.id);

    const isCity = state.cities.some((city) => {
      const { x, y } = screenToCellPosition(squad.pos);

      return city.x === x && city.y === y;
    });

    state.squads = state.squads.update(squad.id, (sqd) => ({
      ...sqd,
      status: isCity ? 'guarding_fort' : 'standing',
    }));

    if (squad.squad.force === PLAYER_FORCE) {
      const chara = getChara(state, squad.id);
      stand(chara);
      const portrait = await speak(scene, state, squad);

      SquadArrivedInfoMessageCompleted(scene).emit(portrait);
    } else {
      state.ai = state.ai.set(squad.id, 'DEFEND');
    }
  }
}
