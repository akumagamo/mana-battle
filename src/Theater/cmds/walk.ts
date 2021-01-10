import { getDistance } from "../../utils";
import TheaterScene from "../TheaterScene";
export type WalkCmd = {
  type: "WALK";
  id: string;
  x: number;
  y: number;
};

export const walk = async (scene: TheaterScene, { id, x, y }: WalkCmd) => {
  const chara = scene.charas.get(scene.charaKey(id));

  chara.run(3);

  const delta =
    getDistance({ x: chara.container.x, y: chara.container.y }, { x, y }) * 4;

  return new Promise<void>((resolve) => {
    scene.add.tween({
      targets: chara.container,
      duration: delta,
      x,
      y,
      onComplete: () => {
        chara.stand();
        resolve();
      },
    });
  });
};
