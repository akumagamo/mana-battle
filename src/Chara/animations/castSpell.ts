import { GAME_SPEED } from "../../env";
import { Chara } from "../Model";
import defaultPose from "./defaultPose";

const ATTACK_DURATION = 500;

export default (chara: Chara, onComplete: () => void) => {
  defaultPose(chara);

  chara.props.scene.tweens.add({
    targets: chara.mainHandContainer,
    yoyo: true,
    x: chara.mainHandContainer?.x + (chara.props.front ? -5 : 5),
    y: chara.mainHandContainer?.y - 5,
    duration: ATTACK_DURATION / GAME_SPEED,
    ease: "ExpoOut",
    onComplete: () => {
      onComplete();
    },
  });

  chara.props.scene.tweens.add({
    targets: chara.offHandContainer,
    yoyo: true,
    rotation: chara.props.front ? -1.2 : 0.5,
    x: chara.offHandContainer.x + (chara.props.front ? 5 : -5),
    Y: chara.offHandContainer.y - 5,
    duration: ATTACK_DURATION / GAME_SPEED,
    ease: "ExpoOut",
  });

  if (process.env.SOUND_ENABLED) {
    chara.scene.sound.add("fireball").play();
  }
};
