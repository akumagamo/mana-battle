import {Chara} from '../Chara';

export default (chara: Chara, damage: number, isKilled: boolean) => {
  const FLINCH_DURATION = 200;
  const FLINCH_ROTATION = -0.2;

  chara.parent.tweens.add({
    targets: chara?.container,
    rotation: chara.front ? FLINCH_ROTATION : FLINCH_ROTATION * -1 ,
    yoyo: !isKilled,
    duration: isKilled ? FLINCH_DURATION / 2 : FLINCH_DURATION,
    onComplete: () => {
      // TODO: the scene should not have the power to control this
      if (isKilled) chara.die();
    },
  });

  // TODO: this should move to the parent scene
  const dmg = chara.parent.add.text(-25, 0, damage.toString(), {fontSize: 48});
  dmg.setShadow(2,2,'#000')
  dmg.setStroke('#000000', 2);

  chara.container.add(dmg);

  chara.parent.tweens.add({
    targets: dmg,
    y: -200,
    alpha: 0,
    duration: 3000,
    ease: 'Expo',
    onComplete: () => {
      dmg.destroy();
    },
  });
};
