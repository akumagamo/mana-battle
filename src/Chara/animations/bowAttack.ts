import { Chara } from "../Chara";

const ATTACK_DURATION = 500;

export default (chara: Chara, onComplete: () => void) => {
  chara.clearAnimations();

  chara.props.parent.tweens.add({
    targets: chara?.mainHandContainer,
    yoyo: true,
    x: (chara.mainHandContainer?.x || 0) + (chara.props.front ? -30 : 30),
    y: (chara.mainHandContainer?.y || 0) - 20,
    duration: ATTACK_DURATION,
    ease: "ExpoOut",
    onComplete: () => {
      onComplete();
    },
  });

  chara.props.parent.tweens.add({
    targets: chara?.offHandContainer,
    yoyo: true,
    rotation: chara.props.front ? -1.2 : 0.5,
    x: (chara.mainHandContainer?.y || 0) + 20,
    Y: (chara.mainHandContainer?.y || 0) - 5,
    duration: ATTACK_DURATION,
    ease: "ExpoOut",
  });

  if (process.env.SOUND_ENABLED) {
    chara.sound.add("sword_hit").play();
  }
};
