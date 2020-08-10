import {Chara} from '../Chara';

const ATTACK_DURATION = 250;

export default (chara: Chara, onComplete: () => void) => {
  chara.clearAnimations();

  chara.parent.tweens.add({
    targets: chara?.mainHandContainer,
    rotation: chara.front ? 1.9 : -1.9,
    yoyo: true,
    x: (chara.mainHandContainer?.x || 0) + (chara.front ? 30 : -60),
    Y: (chara.mainHandContainer?.y || 0) - 20,
    duration: ATTACK_DURATION,
    ease: 'Expo',
    onComplete: () => {
      onComplete();
    },
  });

  chara.sound.add('sword_hit').play()
  
};
