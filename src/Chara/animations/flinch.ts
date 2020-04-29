import {Chara} from '../Chara';

export default (chara: Chara, damage: number, isKilled: boolean) => {
  const FLINCH_DURATION = 500;

  chara.parent.tweens.add({
    targets: chara?.container,
    rotation: 0.15,
    yoyo: true,
    duration: FLINCH_DURATION,
    onComplete: () => {

      console.log(`............`,isKilled)
      return isKilled ? chara.die() : null},
  });

  const dmg = chara.parent.add.text(0, 0, damage.toString(), {fontSize: 32});

  chara.container?.add(dmg);

  chara.parent.tweens.add({
    targets: dmg,
    y: -100,
    alpha: 0,
    duration: 1500,
    ease: 'Expo',
    onComplete: () => {
      dmg.destroy();
    },
  });
};
