import text from '../../UI/text';
import {Chara} from '../Chara';

export function displayExperience(chara: Chara, experience: number) {
  const xp = text(
    -50,
    -100,
    `${experience.toString()} xp`,
    chara.charaWrapper,
    chara.parent,
  );
  xp.setScale(1.5);
  xp.setShadow(0, 0, '#000', 2);
  xp.setStroke('#000000', 2);
  chara.container.add(xp);

  return new Promise<void>((resolve) => {
    chara.parent.tweens.add({
      targets: xp,
      y: -120,
      alpha: 0,
      duration: 1000,
      onComplete: () => {
        xp.destroy();
        resolve();
      },
    });
  });
}
