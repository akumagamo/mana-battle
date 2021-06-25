import { Chara } from '../Model';
import die from './die';

const GAME_SPEED = parseInt(process.env.SPEED);

// TODO: refactor to return promise
export default (chara: Chara, isKilled: boolean) => {
  const FLINCH_DURATION = 200 / GAME_SPEED;
  const FLINCH_ROTATION = -0.2;

  chara.props.scene.tweens.add({
    targets: chara.container,
    rotation: chara.props.front ? FLINCH_ROTATION : FLINCH_ROTATION * -1,
    yoyo: !isKilled,
    duration: isKilled ? FLINCH_DURATION : FLINCH_DURATION,
    onComplete: () => {
      chara.scene.time.addEvent({
        delay: 20 / GAME_SPEED,
        // TODO: the animation should not have the power to control this
        callback: () => (isKilled ? die(chara) : null),
      });
    },
  });

  chara.scene.tweens.add({
    targets: chara?.container,
    alpha: 0,
    yoyo: true,
    repeat: 2,
    duration: 20 / GAME_SPEED,
  });
};
