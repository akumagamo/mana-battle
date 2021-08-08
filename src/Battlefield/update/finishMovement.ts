import {Vector} from 'matter';
import {PLAYER_FORCE} from '../../constants';
import {screenToCellPosition} from '../board/position';
import SquadArrivedInfoMessageCompleted from '../events/SquadArrivedInfoMessageCompleted';
import SquadFinishesMovement from '../events/SquadFinishesMovement';
import {getChara, MapSquad, MapState} from '../Model';
import speak from '../rendering/speak';

export default async function (
  scene: Phaser.Scene,
  state: MapState,
  path: Vector[],
  squad: MapSquad,
) {
  const [, ...remaining] = path;

  if (remaining.length > 0) {
    state.squadsInMovement = state.squadsInMovement.set(squad.id, {
      path: remaining,
      squad,
    });
  } else {
    SquadFinishesMovement(scene).emit(squad);
  }
}
