import {Chara} from '../Chara';

const ATTACK_DURATION = 250;

export default (chara: Chara, onComplete: () => void) => {
  chara.clearAnimations();

  chara.parent.tweens.add({
    targets: chara?.mainHandContainer,
    rotation: 1.9,
    yoyo: true,
    x: (chara.mainHandContainer?.x || 0) + 30,
    Y: (chara.mainHandContainer?.y || 0) - 20,
    duration: ATTACK_DURATION,
    ease: 'Expo',
    onComplete: () => {
      onComplete();
    },
  });
};
