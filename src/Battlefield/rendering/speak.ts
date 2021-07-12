import { GAME_SPEED } from '../../env';
import button from '../../UI/button';
import speech from '../../UI/speech';
import SquadArrivedInfoMessageClosed from '../events/SquadArrivedInfoMessageClosed';
import { getSquadLeader, MapSquad, MapState } from '../Model';

export default async function (
  scene: Phaser.Scene,
  state: MapState,
  squad: MapSquad
) {
  state.isPaused = true;

  const leader = getSquadLeader(state, squad.id);
  const res = await speech(
    leader,
    450,
    70,
    'We arrived at the target destination.',
    state.uiContainer,
    scene,
    GAME_SPEED
  );

  button(850, 185, 'Ok', state.uiContainer, scene, () =>
    SquadArrivedInfoMessageClosed(scene).emit(res.portrait)
  );

  state.uiContainer.add(res.portrait.container);

  return res.portrait;
}
