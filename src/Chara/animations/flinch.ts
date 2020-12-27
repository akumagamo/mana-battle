import text from '../../UI/text';
import {Chara} from '../Chara';

export default (chara: Chara, damage: number, isKilled: boolean) => {
  const FLINCH_DURATION = 200;
  const FLINCH_ROTATION = -0.2;

  chara.parent.tweens.add({
    targets: chara?.container,
    rotation: chara.front ? FLINCH_ROTATION : FLINCH_ROTATION * -1,
    yoyo: !isKilled,
    duration: isKilled ? FLINCH_DURATION / 2 : FLINCH_DURATION,
    onComplete: () => {
      // TODO: the scene should not have the power to control this
      if (isKilled) chara.die();
    },
  });

  chara.tweens.add({
    targets: chara?.container,
    alpha: 0,
    yoyo: true,
    repeat: 2,
    duration: 20,
  });

  // TODO: this should move to the parent scene
  const dmg = text(
    chara.container.x - 50,
    chara.container.y + 0,
    damage.toString(),
    chara.charaWrapper,
    chara.parent,
  );
  dmg.setScale(2);
  dmg.setShadow(2, 2, '#000');
  dmg.setStroke('#000000', 2);

  chara.parent.tweens.add({
    targets: dmg,
    y: -100,
    alpha: 0,
    duration: 3000,
    ease: 'Expo',
    onComplete: () => dmg.destroy(),
  });
};
