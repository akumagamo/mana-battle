import { GAME_SPEED } from '../../env';
import button from '../../UI/button';
import speech from '../../UI/speech';
import SquadArrivedInfoMessageClosed from '../events/SquadArrivedInfoMessageClosed';
import { MapScene } from '../MapScene';
import { getSquadLeader, MapSquad, MapState } from '../Model';

export default async function (
  scene: MapScene,
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

  button(950, 180, 'Ok', state.uiContainer, scene, () =>
    SquadArrivedInfoMessageClosed(scene).emit(res.portrait)
  );

  state.uiContainer.add(res.portrait.container);

  return res.portrait;
}
