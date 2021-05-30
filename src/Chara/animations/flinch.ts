import { Chara } from "../Chara";
import { displayDamage } from "./displayDamage";

const GAME_SPEED = parseInt(process.env.SPEED);

export default (
  chara: Chara,
  damage: number,
  isKilled: boolean
) => {
  const FLINCH_DURATION = 200 / GAME_SPEED;
  const FLINCH_ROTATION = -0.2;

  chara.props.parent.tweens.add({
    targets: chara?.container,
    rotation: chara.props.front ? FLINCH_ROTATION : FLINCH_ROTATION * -1,
    yoyo: !isKilled,
    duration: isKilled ? FLINCH_DURATION : FLINCH_DURATION,
    onComplete: () => {
      chara.time.addEvent({
        delay: 20 / GAME_SPEED,
        // TODO: the animation should not have the power to control this
        callback: () => (isKilled ? chara.die() : null),
      });
    },
  });

  chara.tweens.add({
    targets: chara?.container,
    alpha: 0,
    yoyo: true,
    repeat: 2,
    duration: 20 / GAME_SPEED,
  });

  // TODO: this should move to the parent scene
  displayDamage(chara, damage);
};
