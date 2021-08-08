import {Chara} from '../Model';

export default async (chara: Chara) => {
  return new Promise<void>((resolve) => {
    const duration = 500;

    chara.scene.tweens.addCounter({
      from: 255,
      to: 0,
      duration,
      onComplete: () => {
        resolve();
      },
      onUpdate: (tween) => {
        var value = Math.floor(tween.getValue());

        chara.tint(value);
      },
    });
  });
};
