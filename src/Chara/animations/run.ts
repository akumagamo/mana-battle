import { maybeZero } from "../../utils";
import upAndDown from "./upAndDown";
import defaultPose from "./defaultPose";
import { Chara } from "../Model";
import { GAME_SPEED } from "../../env";

const front = (chara: Chara, speed: number = 1) => {
  chara.scene.add.tween({
    targets: chara.leftFoot,
    x: chara.leftFoot?.x || 0 - 20,
    yoyo: true,
    rotation: -0.2,
    repeat: -1,
    duration: 500 / GAME_SPEED,
  });

  chara.scene.add.tween({
    targets: chara.rightFoot,
    x: chara.rightFoot?.x || 0 + 10,
    yoyo: true,
    rotation: -0.2,
    repeat: -1,
    duration: 500 / GAME_SPEED,
  });

  chara.scene.add.tween({
    targets: chara.leftHand,
    x: chara.leftHand?.x || 0 + 3,
    yoyo: true,
    rotation: -0.2,
    repeat: -1,
    duration: 500 / GAME_SPEED,
  });

  chara.scene.add.tween({
    targets: chara.mainHandContainer,
    x: chara.mainHandContainer?.x || 0 - 3,
    yoyo: true,
    rotation: -0.2,
    repeat: -1,
    duration: 500 / GAME_SPEED,
  });

  chara.scene.add.tween({
    targets: chara.innerWrapper,
    y: chara.innerWrapper.y - 20,
    yoyo: true,
    repeat: -1,
    duration: (100 / GAME_SPEED) * speed,
  });
};

const back = (chara: Chara, speed = 1) => {
  const bounce = upAndDown(chara);

  bounce(chara.innerWrapper, -12, 300);

  chara.scene.add.tween({
    targets: chara.leftFoot,
    x: maybeZero(chara.leftFoot?.x) - 20,
    yoyo: true,
    rotation: -0.2,
    repeat: -1,
    duration: 500 / GAME_SPEED,
  });

  chara.scene.add.tween({
    targets: chara.rightFoot,
    x: maybeZero(chara.rightFoot?.x) + 10,
    yoyo: true,
    rotation: -0.2,
    repeat: -1,
    duration: 500 / GAME_SPEED,
  });

  chara.scene.add.tween({
    targets: chara.leftHand,
    x: maybeZero(chara.leftHand?.x) + 10,
    yoyo: true,
    rotation: -0.2,
    repeat: -1,
    duration: 500 / GAME_SPEED,
  });

  chara.scene.add.tween({
    targets: chara.mainHandContainer,
    x: maybeZero(chara.mainHandContainer?.x) - 10,
    yoyo: true,
    rotation: -0.2,
    repeat: -1,
    duration: 500 / GAME_SPEED,
  });

  chara.scene.add.tween({
    targets: chara.innerWrapper,
    y: chara.innerWrapper.y - 20,
    yoyo: true,
    repeat: -1,
    duration: (100 / GAME_SPEED) * speed,
  });
};

export default (chara: Chara, speed?: number) => {
  defaultPose(chara);
  if (chara.props.front) {
    front(chara, speed);
  } else {
    back(chara, speed);
  }
};
