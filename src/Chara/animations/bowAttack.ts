import {GAME_SPEED} from '../../env';
import {Chara} from '../Model';

const ATTACK_DURATION = 500;

export default (chara: Chara, onComplete: () => void) => {
  chara.cast();

  chara.scene.time.addEvent({
    delay: ATTACK_DURATION / GAME_SPEED,
    callback: () => {
      onComplete();
    },
  });

  if (process.env.SOUND_ENABLED) {
    chara.scene.sound.add('sword_hit').play();
  }
};
