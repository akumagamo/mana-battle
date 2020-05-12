import {INVALID_STATE} from '../../errors';
import {Chara} from '../Chara';
import {
  CHARA_WRAPPER_X,
  CHARA_WRAPPER_Y,
  HEAD_FRONT_X,
  HEAD_FRONT_Y,
  LEFT_FOOT_FRONT_X,
  LEFT_FOOT_FRONT_Y,
  RIGHT_FOOT_FRONT_X,
  RIGHT_FOOT_FRONT_Y,
  LEFT_HAND_FRONT_X,
  LEFT_HAND_FRONT_Y,
  RIGHT_HAND_FRONT_X,
  RIGHT_HAND_FRONT_Y,
  HEAD_BACK_Y,
  HEAD_BACK_X,
  LEFT_FOOT_BACK_X,
  LEFT_FOOT_BACK_Y,
  RIGHT_FOOT_BACK_X,
  RIGHT_FOOT_BACK_Y,
  LEFT_HAND_BACK_X,
  LEFT_HAND_BACK_Y,
  RIGHT_HAND_BACK_X,
  RIGHT_HAND_BACK_Y,
} from './constants';

export default (chara: Chara) => {
  chara.tweens.killAll();
  if (
    !chara.head ||
    !chara.trunk ||
    !chara.leftHand ||
    !chara.mainHandContainer ||
    !chara.leftFoot ||
    !chara.rightFoot ||
    !chara.charaWrapper
  ) {
    throw new Error(INVALID_STATE);
  }

  chara.head.rotation = 0;
  chara.leftFoot.rotation = 0;
  chara.leftHand.rotation = 0;
  chara.rightFoot.rotation = 0;
  chara.mainHandContainer.rotation = 0;
  chara.trunk.rotation = 0;

  if (chara.front) {
    chara.charaWrapper.x = CHARA_WRAPPER_X;
    chara.charaWrapper.y = CHARA_WRAPPER_Y;
    chara.head.x = HEAD_FRONT_X;
    chara.head.y = HEAD_FRONT_Y;
    chara.leftFoot.x = LEFT_FOOT_FRONT_X;
    chara.leftFoot.y = LEFT_FOOT_FRONT_Y;
    chara.rightFoot.x = RIGHT_FOOT_FRONT_X;
    chara.rightFoot.y = RIGHT_FOOT_FRONT_Y;
    chara.leftHand.x = LEFT_HAND_FRONT_X;
    chara.leftHand.y = LEFT_HAND_FRONT_Y;
    chara.mainHandContainer.x = RIGHT_HAND_FRONT_X;
    chara.mainHandContainer.y = RIGHT_HAND_FRONT_Y;
  } else {
    chara.charaWrapper.x = CHARA_WRAPPER_X;
    chara.charaWrapper.y = CHARA_WRAPPER_Y;
    chara.head.x = HEAD_BACK_X;
    chara.head.y = HEAD_BACK_Y;
    chara.leftFoot.x = LEFT_FOOT_BACK_X;
    chara.leftFoot.y = LEFT_FOOT_BACK_Y;
    chara.rightFoot.x = RIGHT_FOOT_BACK_X;
    chara.rightFoot.y = RIGHT_FOOT_BACK_Y;
    chara.leftHand.x = LEFT_HAND_BACK_X;
    chara.leftHand.y = LEFT_HAND_BACK_Y;
    chara.mainHandContainer.x = RIGHT_HAND_BACK_X;
    chara.mainHandContainer.y = RIGHT_HAND_BACK_Y;
  }
};