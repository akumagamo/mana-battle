import { Chara } from "../Model";
import tint from "./tint";

export default async (chara: Chara) => {
  return new Promise<void>((resolve) => {
    const duration = 500;

    chara.scene.time.addEvent({
      delay: duration * 2,
      callback: resolve,
    });
    chara.scene.tweens.addCounter({
      from: 255,
      to: 0,
      duration,
      onComplete: () => {
        chara.scene.tweens.add({
          targets: chara.container,
          alpha: 0,
          duration,
        });
      },
      onUpdate: (tween) => {
        var value = Math.floor(tween.getValue());

        tint(chara, value);
      },
    });
  });
};
