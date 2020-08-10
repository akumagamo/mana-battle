import {Chara} from '../Chara';
import {
  LEFT_FOOT_FRONT_X,
  LEFT_FOOT_FRONT_Y,
  RIGHT_FOOT_FRONT_Y,
  RIGHT_FOOT_FRONT_X,
  LEFT_HAND_FRONT_X,
  LEFT_HAND_FRONT_Y,
  TRUNK_FRONT_X,
  TRUNK_FRONT_Y,
  HEAD_FRONT_Y,
  HEAD_FRONT_X,
  RIGHT_HAND_FRONT_X,
  RIGHT_HAND_FRONT_Y,
  RIGHT_HAND_BACK_X,
  RIGHT_HAND_BACK_Y,
  LEFT_FOOT_BACK_X,
  RIGHT_FOOT_BACK_Y,
  RIGHT_FOOT_BACK_X,
  LEFT_FOOT_BACK_Y,
  TRUNK_BACK_X,
  TRUNK_BACK_Y,
  HEAD_BACK_X,
  HEAD_BACK_Y,
  LEFT_HAND_BACK_Y,
  LEFT_HAND_BACK_X,
} from './constants';

function front(scene: Chara) {

const {skinColor, hair, hairColor} = scene.unit.style
  const renderHair = (gx: number, gy: number) => {
    const hairSprite = scene.add.image(
      gx,
      gy,
      hair,
    );
    hairSprite.setTint(hairColor)
    scene.container?.add(hairSprite);
    return hairSprite;
  };
  const renderHead = (gx: number, gy: number) => {
    const head = scene.add.image(
      gx,
      gy,
      'head' + scene.unit.style.head.toString(),
    );
    head.setTint(skinColor)
    scene.container?.add(head);
    return head;
  };

  const renderFoot = (footX: number, footY: number) => {
    const foot = scene.add.image(footX, footY, 'foot');
    scene.container?.add(foot);
    return foot;
  };

  const renderTrunk = (class_: string, trunkX: number, trunkY: number) => {
    const trunk = scene.add.image(trunkX, trunkY, `trunk_${class_}`);

    scene.container?.add(trunk);

    return trunk;
  };

  const renderHand = (handX: number, handY: number, scaleX: number) => {
    const hand = scene.add.image(handX, handY, 'hand');
    hand.setTint(skinColor)
    hand.scaleX = scaleX;
    scene.container?.add(hand);
    return hand;
  };

  scene.leftFoot = renderFoot(LEFT_FOOT_FRONT_X, LEFT_FOOT_FRONT_Y);
  scene.rightFoot = renderFoot(RIGHT_FOOT_FRONT_X, RIGHT_FOOT_FRONT_Y);
  scene.leftHand = renderHand(LEFT_HAND_FRONT_X, LEFT_HAND_FRONT_Y, -1);
  scene.trunk = renderTrunk(scene.unit.class, TRUNK_FRONT_X, TRUNK_FRONT_Y);
  scene.head = renderHead(HEAD_FRONT_X, HEAD_FRONT_Y);
  scene.hair = renderHair(HEAD_FRONT_X, HEAD_FRONT_Y);

  scene.mainHandContainer = scene.add.container(
    RIGHT_HAND_FRONT_X,
    RIGHT_HAND_FRONT_Y,
  );

  scene.mainHand = scene.add.image(
    10,
    10,
    `equips/${scene.unit.equips.mainHand}`,
  );
  scene.mainHandContainer.add(scene.mainHand);

  if (scene.unit.equips.mainHand === 'oaken_staff') {
    scene.mainHand.setScale(0.3);
    scene.mainHand.setOrigin(0.45, 0.7);
    scene.mainHand.setRotation(-0.2);
  } else {
    scene.mainHand.setScale(0.2);
    scene.mainHand.setOrigin(1, 1);
  }

  scene.rightHand = renderHand(-2, 0, 1);
  scene.rightHand.rotation = -2.2;
  scene.container?.add(scene.mainHandContainer);
  scene.mainHandContainer.add(scene.rightHand);
}
function back(scene: Chara) {
const {skinColor, hair, hairColor} = scene.unit.style
  const renderHair = (gx: number, gy: number) => {
    const hairSprite = scene.add.image(
      gx,
      gy,
      'back_'+hair,
    );
    hairSprite.setTint(hairColor)
    scene.container?.add(hairSprite);
    return hairSprite;
  };

  function renderHead(gx: number, gy: number) {
    const head = scene.add.image(
      gx,
      gy,
      'back_head' + scene.unit.style.head.toString(),
    );
    head.setTint(skinColor)
    scene.container?.add(head);
    return head;
  }

  function renderFoot(footX: number, footY: number) {
    const foot = scene.add.image(footX, footY, 'foot');

    foot.scaleX = -1;
    foot.rotation = 0.6;
    scene.container?.add(foot);

    return foot;
  }

  function renderTrunk(class_: string, trunkX: number, trunkY: number) {
    const trunk = scene.add.image(trunkX, trunkY, `trunk_back_${class_}`);

    scene.container?.add(trunk);

    return trunk;
  }

  function renderHand(handX: number, handY: number) {
    const hand = scene.add.image(handX, handY, 'hand');

    hand.setTint(skinColor)
    scene.container?.add(hand);
    return hand;
  }

  scene.mainHandContainer = scene.add.container(
    RIGHT_HAND_BACK_X,
    RIGHT_HAND_BACK_Y,
  );
  scene.container?.add(scene.mainHandContainer);

  scene.mainHand = scene.add.image(
    -10,
    20,
    `equips/${scene.unit.equips.mainHand}`,
  );
  scene.mainHandContainer.add(scene.mainHand);
  scene.mainHand.setScale(-0.2, 0.2);
  scene.mainHand.setOrigin(1, 1);

  scene.rightHand = renderHand(12, 16);
  scene.rightHand.setOrigin(0.5)
  scene.rightHand.setScale(-1,1)
  scene.rightHand.setRotation(1.6)
  scene.mainHandContainer.add(scene.rightHand);

  scene.rightFoot = renderFoot(RIGHT_FOOT_BACK_X, RIGHT_FOOT_BACK_Y);
  scene.rightFoot.scaleY = -1;
  scene.leftFoot = renderFoot(LEFT_FOOT_BACK_X, LEFT_FOOT_BACK_Y);
  scene.leftFoot.scaleY = -1;

  scene.trunk = renderTrunk(scene.unit.class, TRUNK_BACK_X, TRUNK_BACK_Y);
  scene.head = renderHead(HEAD_BACK_X, HEAD_BACK_Y);
  scene.hair = renderHair(HEAD_FRONT_X, HEAD_FRONT_Y);
  scene.leftHand = renderHand(LEFT_HAND_BACK_X, LEFT_HAND_BACK_Y);
}

export default (chara: Chara) => {
  if (chara.front) front(chara);
  else back(chara);
};
