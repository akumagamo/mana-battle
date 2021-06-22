import { healSquads } from './events/healSquadsTick';
import { MapScene } from './MapScene';
import { MapState } from './Model';
import moveSquads from './update/moveSquads';

export default function (scene: MapScene, state: MapState) {
  if (!state.isPaused) {
    moveSquads(scene, state);

    state.timeOfDay += 1;
    state.tick += 1;

    if (state.tick === 100) {
      healSquads(state);
      state.tick = 0;
    }
  }
}
