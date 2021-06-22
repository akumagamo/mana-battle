import { Vector } from "matter";
import { SCREEN_WIDTH, SCREEN_HEIGHT } from "../../constants";
import { MapScene } from "../MapScene";

export default function moveCameraTo(
  scene: MapScene,
  { x, y }: Vector,
  duration: number
) {
  x = x * -1 + SCREEN_WIDTH / 2;

  y = y * -1 + SCREEN_HEIGHT / 2;

  const tx = () => {
    if (x < scene.bounds.x.min) return scene.bounds.x.min;
    else if (x > scene.bounds.x.max) return scene.bounds.x.max;
    else return x;
  };
  const ty = () => {
    if (y < scene.bounds.y.min) return scene.bounds.y.min;
    else if (y > scene.bounds.y.max) return scene.bounds.y.max;
    else return y;
  };

  return new Promise<void>((resolve) => {
    scene.tweens.add({
      targets: scene.mapContainer,
      x: tx(),
      y: ty(),
      duration: duration,
      ease: "cubic.out",
      onComplete: () => {
        resolve();
      },
    });

    scene.tweens.add({
      targets: scene,
      mapX: tx(),
      mapY: ty(),
      duration: duration,
      ease: "cubic.out",
    });
  });
}
