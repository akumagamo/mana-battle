import {Chara} from '../Chara';
import {
  LEFT_FOOT_FRONT_X,
  RIGHT_FOOT_FRONT_X,
  LEFT_HAND_FRONT_X,
  RIGHT_HAND_FRONT_X,
  CHARA_WRAPPER_Y,
} from './constants';

// TODO: ^^^^ these constants belong to something that we may call "default pose"

const front = (chara: Chara) => {
  chara.clearAnimations();

  chara.add.tween({
    targets: chara.leftFoot,
    x: LEFT_FOOT_FRONT_X - 20,
    yoyo: true,
    rotation: -0.2,
    repeat: -1,
    duration: 500,
  });

  chara.add.tween({
    targets: chara.rightFoot,
    x: RIGHT_FOOT_FRONT_X + 10,
    yoyo: true,
    rotation: -0.2,
    repeat: -1,
    duration: 500,
  });

  chara.add.tween({
    targets: chara.leftHand,
    x: LEFT_HAND_FRONT_X + 10,
    yoyo: true,
    rotation: -0.2,
    repeat: -1,
    duration: 500,
  });

  chara.add.tween({
    targets: chara.mainHandContainer,
    x: RIGHT_HAND_FRONT_X - 10,
    yoyo: true,
    rotation: -0.2,
    repeat: -1,
    duration: 500,
  });

  chara.add.tween({
    targets: chara.charaWrapper,
    y: CHARA_WRAPPER_Y - 20,
    yoyo: true,
    repeat: -1,
    duration: 100,
  });
};

const back = (chara: Chara) => {
  chara.clearAnimations();

  chara.add.tween({
    targets: chara.leftFoot,
    x: LEFT_FOOT_FRONT_X - 20,
    yoyo: true,
    rotation: -0.2,
    repeat: -1,
    duration: 500,
  });

  chara.add.tween({
    targets: chara.rightFoot,
    x: RIGHT_FOOT_FRONT_X + 10,
    yoyo: true,
    rotation: -0.2,
    repeat: -1,
    duration: 500,
  });

  chara.add.tween({
    targets: chara.leftHand,
    x: LEFT_HAND_FRONT_X + 10,
    yoyo: true,
    rotation: -0.2,
    repeat: -1,
    duration: 500,
  });

  chara.add.tween({
    targets: chara.mainHandContainer,
    x: RIGHT_HAND_FRONT_X - 10,
    yoyo: true,
    rotation: -0.2,
    repeat: -1,
    duration: 500,
  });

  chara.add.tween({
    targets: chara.charaWrapper,
    y: CHARA_WRAPPER_Y - 20,
    yoyo: true,
    repeat: -1,
    duration: 100,
  });
};

export default (chara:Chara)=>{
  if(chara.front){
    front(chara)
  }else{
    back(chara)
  } 
}
