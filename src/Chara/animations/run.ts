import { Chara } from "../Chara";
import { maybeZero } from "../../utils";
import upAndDown from "./upAndDown";

// TODO: ^^^^ these constants belong to something that we may call "default pose"

const front = (chara: Chara) => {
  chara.clearAnimations();

  chara.add.tween({
    targets: chara.leftFoot,
    x: chara.leftFoot.x - 20,
    yoyo: true,
    rotation: -0.2,
    repeat: -1,
    duration: 500,
  });

  chara.add.tween({
    targets: chara.rightFoot,
    x: chara.rightFoot.x + 10,
    yoyo: true,
    rotation: -0.2,
    repeat: -1,
    duration: 500,
  });

  chara.add.tween({
    targets: chara.leftHand,
    x: chara.leftHand.x + 3,
    yoyo: true,
    rotation: -0.2,
    repeat: -1,
    duration: 500,
  });

  chara.add.tween({
    targets: chara.mainHandContainer,
    x: chara.mainHandContainer.x - 3,
    yoyo: true,
    rotation: -0.2,
    repeat: -1,
    duration: 500,
  });

  chara.add.tween({
    targets: chara.charaWrapper,
    y: chara.charaWrapper.y - 20,
    yoyo: true,
    repeat: -1,
    duration: 100,
  });
};

const back = (chara: Chara) => {
  chara.clearAnimations();

  const bounce = upAndDown(chara);

  bounce(chara.charaWrapper, -12, 100);

  chara.add.tween({
    targets: chara.leftFoot,
    x: maybeZero(chara.leftFoot?.x) - 20,
    yoyo: true,
    rotation: -0.2,
    repeat: -1,
    duration: 500,
  });

  chara.add.tween({
    targets: chara.rightFoot,
    x: maybeZero(chara.rightFoot?.x) + 10,
    yoyo: true,
    rotation: -0.2,
    repeat: -1,
    duration: 500,
  });

  chara.add.tween({
    targets: chara.leftHand,
    x: maybeZero(chara.leftHand?.x) + 10,
    yoyo: true,
    rotation: -0.2,
    repeat: -1,
    duration: 500,
  });

  chara.add.tween({
    targets: chara.mainHandContainer,
    x: maybeZero(chara.mainHandContainer?.x) - 10,
    yoyo: true,
    rotation: -0.2,
    repeat: -1,
    duration: 500,
  });
};

export default (chara: Chara) => {
  if (chara.front) {
    front(chara);
  } else {
    back(chara);
  }
};
