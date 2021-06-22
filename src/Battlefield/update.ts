import { healSquads } from './events/healSquadsTick';
import { MapScene } from './MapScene';
import moveSquads from './update/moveSquads';

export default function (scene: MapScene) {
  if (!scene.state.isPaused) {
    moveSquads(scene);

    scene.state.timeOfDay += 1;
    scene.state.tick += 1;

    if (scene.state.tick === 100) {
      healSquads(scene.state);
      scene.state.tick = 0;
    }
  }
}
