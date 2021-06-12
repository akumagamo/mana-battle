import { Chara } from '../Model';
import defaultPose from './defaultPose';

const ATTACK_DURATION = 250;

const GAME_SPEED = parseInt(process.env.SPEED);

export default (chara: Chara, onComplete: () => void) => {
  defaultPose(chara);

  chara.props.parent.tweens.add({
    targets: chara?.mainHandContainer,
    rotation: chara.props.front ? 1.9 : -1.9,
    yoyo: true,
    x: (chara.mainHandContainer?.x || 0) + (chara.props.front ? 30 : -10),
    Y: (chara.mainHandContainer?.y || 0) + (chara.props.front ? -20 : -40),
    duration: ATTACK_DURATION / GAME_SPEED,
    ease: 'Expo',
    onComplete: () => {
      onComplete();
    },
  });

  if (process.env.SOUND_ENABLED) {
    chara.scene.sound.add('sword_hit').play();
  }
};
