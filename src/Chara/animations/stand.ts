import {Chara} from '../Chara';
import {
  HEAD_FRONT_Y,
  TRUNK_FRONT_Y,
  LEFT_HAND_FRONT_Y,
  RIGHT_HAND_FRONT_Y,
} from './constants';
import upAndDown from './upAndDown';

const front = (chara: Chara) => {
  chara.clearAnimations();

  chara.tweens.add({
    targets: chara.head,
    y: HEAD_FRONT_Y - 2,
    duration: 1600,
    yoyo: true,
    repeat: -1,
  });

  chara.tweens.add({
    targets: chara.trunk,
    y: TRUNK_FRONT_Y + 2,
    duration: 1600,
    yoyo: true,
    repeat: -1,
  });

  chara.tweens.add({
    targets: chara.leftHand,
    y: LEFT_HAND_FRONT_Y + 8,
    duration: 1600,
    yoyo: true,
    repeat: -1,
  });

  chara.tweens.add({
    targets: chara.mainHandContainer,
    y: RIGHT_HAND_FRONT_Y - 4,
    duration: 1600,
    yoyo: true,
    repeat: -1,
  });
};

const back = (chara: Chara) => {
  chara.clearAnimations();

  const bounce = upAndDown(chara)

  bounce(chara.head,-2, 1600);

  bounce(chara.trunk, 2, 1600);

  bounce(chara.leftHand, 4, 1600);

  bounce(chara.mainHandContainer, -4, 1600);
};

export default (chara: Chara) => {
  if (chara.front) front(chara);
  else back(chara);
};
