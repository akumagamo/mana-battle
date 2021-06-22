import { Vector } from 'matter';
import { SCREEN_WIDTH, SCREEN_HEIGHT } from '../../constants';
import { MapScene } from '../MapScene';
import { MapState } from '../Model';

export default function moveCameraTo(
  scene: MapScene,
  state: MapState,
  { x, y }: Vector,
  duration: number
) {
  x = x * -1 + SCREEN_WIDTH / 2;

  y = y * -1 + SCREEN_HEIGHT / 2;

  const tx = () => {
    if (x < state.bounds.x.min) return state.bounds.x.min;
    else if (x > state.bounds.x.max) return state.bounds.x.max;
    else return x;
  };
  const ty = () => {
    if (y < state.bounds.y.min) return state.bounds.y.min;
    else if (y > state.bounds.y.max) return state.bounds.y.max;
    else return y;
  };

  return new Promise<void>((resolve) => {
    scene.tweens.add({
      targets: state.mapContainer,
      x: tx(),
      y: ty(),
      duration: duration,
      ease: 'cubic.out',
      onComplete: () => {
        resolve();
      },
    });

    scene.tweens.add({
      targets: scene,
      mapX: tx(),
      mapY: ty(),
      duration: duration,
      ease: 'cubic.out',
    });
  });
}
