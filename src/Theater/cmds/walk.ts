import run from "../../Chara/animations/run";
import stand from "../../Chara/animations/stand";
import { getDistance } from "../../utils";
import TheaterScene from "../TheaterScene";
export type Walk = {
  type: "WALK";
  id: string;
  x: number;
  y: number;
};

export const walk = async (scene: TheaterScene, { id, x, y }: Walk) => {
  const chara = scene.charas.get(scene.charaKey(id));

  run(chara)

  const delta =
    getDistance({ x: chara.container.x, y: chara.container.y }, { x, y }) * 4;

  return new Promise<void>((resolve) => {
    scene.add.tween({
      targets: chara.container,
      duration: delta,
      x,
      y,
      onComplete: () => {
        stand(chara)
        resolve();
      },
    });
  });
};
