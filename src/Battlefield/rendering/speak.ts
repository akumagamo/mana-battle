import { GAME_SPEED } from '../../env';
import button from '../../UI/button';
import speech from '../../UI/speech';
import SquadArrivedInfoMessageClosed from '../events/SquadArrivedInfoMessageClosed';
import { MapScene } from '../MapScene';
import { getSquadLeader, MapSquad } from '../Model';

export default async function (scene: MapScene, squad: MapSquad) {
  scene.state.isPaused = true;

  const leader = getSquadLeader(scene.state, squad.id);
  const res = await speech(
    leader,
    450,
    70,
    'We arrived at the target destination.',
    scene.state.uiContainer,
    scene,
    GAME_SPEED
  );

  button(950, 180, 'Ok', scene.state.uiContainer, scene, () =>
    SquadArrivedInfoMessageClosed(scene).emit(res.portrait)
  );

  scene.state.uiContainer.add(res.portrait.container);

  return res.portrait;
}
