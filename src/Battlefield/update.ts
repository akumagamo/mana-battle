import aiAttack from './ai/aiAttack';
import { healSquads } from './events/healSquadsTick';
import { MapState } from './Model';
import moveSquads from './update/moveSquads';

export default function (scene: Phaser.Scene, state: MapState) {
  if (!state.isPaused) {
    moveSquads(scene, state);

    state.timeOfDay += 1;
    state.tick += 1;

    if (state.tick === 3000) {
      healSquads(state);
      state.tick = 0;

      aiAttack(scene, state);
    }
  }
}
