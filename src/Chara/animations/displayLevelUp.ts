import text from '../../UI/text';
import {Chara} from '../Model';

export async function displayLevelUp(chara: Chara) {
  const lvlUp = text(-100, -100, 'Level up!', chara.container);
  lvlUp.setScale(1.5);
  lvlUp.setShadow(0, 0, '#000', 2);
  lvlUp.setStroke('#000000', 2);

  chara.container.add(lvlUp);

  return new Promise<void>((resolve) => {
    chara.scene.tweens.add({
      targets: lvlUp,
      y: lvlUp.y - 100,
      alpha: 0,
      duration: 1000,
      onComplete: () => {
        lvlUp.destroy();
        resolve();
      },
    });
  });
}
