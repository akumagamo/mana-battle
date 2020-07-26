import {Chara} from '../Chara';

export default (chara: Chara, damage: number, isKilled: boolean) => {
  const FLINCH_DURATION = 500;

  if (isKilled) chara.die();

  chara.parent.tweens.add({
    targets: chara?.container,
    rotation: 0.15,
    yoyo: true,
    duration: FLINCH_DURATION,
  });

  const dmg = chara.parent.add.text(-25, 0, damage.toString(), {fontSize: 48});

  dmg.setStroke('#000000',2)

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
