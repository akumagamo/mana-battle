import {Chara} from '../Chara';

const ATTACK_DURATION = 250;

export default (chara: Chara, onComplete: () => void) => {
  chara.clearAnimations();

  chara.props.parent.tweens.add({
    targets: chara?.mainHandContainer,
    rotation: chara.props.front ? 1.9 : -1.9,
    yoyo: true,
    x: (chara.mainHandContainer?.x || 0) + (chara.props.front ? 30 : -10),
    Y: (chara.mainHandContainer?.y || 0)  + (chara.props.front ? -20 : -40),
    duration: ATTACK_DURATION,
    ease: 'Expo',
    onComplete: () => {
      onComplete();
    },
  });

  chara.sound.add('sword_hit').play()
  
};
