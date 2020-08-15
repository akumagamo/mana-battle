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

function front(chara: Chara) {
  const {skinColor, hair, hairColor} = chara.unit.style;
  const renderHair = (gx: number, gy: number) => {
    if (chara.unit.equips.head !== 'none') return null;
    const hairSprite = chara.add.image(gx, gy, hair);
    hairSprite.setTint(hairColor);
    chara.container?.add(hairSprite);
    return hairSprite;
  };
  const renderHead = (gx: number, gy: number) => {
    const head = chara.add.image(gx, gy, 'head');
    head.setTint(skinColor);
    chara.container?.add(head);
    return head;
  };

  const renderFoot = (footX: number, footY: number) => {
    const foot = chara.add.image(footX, footY, 'foot');
    chara.container?.add(foot);
    return foot;
  };

  const renderTrunk = (class_: string, trunkX: number, trunkY: number) => {
    const trunk = chara.add.image(trunkX, trunkY, `trunk_${class_}`);

    chara.container?.add(trunk);

    return trunk;
  };

  const renderHand = (handX: number, handY: number, scaleX: number) => {
    const hand = chara.add.image(handX, handY, 'hand');
    hand.setTint(skinColor);
    hand.scaleX = scaleX;
    chara.container?.add(hand);
    return hand;
  };

  function renderHat(x: number, y: number) {
    if (chara.unit.equips.head === 'none') return null;

    const hat = chara.add.image(x, y, `equips/${chara.unit.equips.head}`);

    chara.container?.add(hat);
    return hat;
  }

  chara.leftFoot = renderFoot(LEFT_FOOT_FRONT_X, LEFT_FOOT_FRONT_Y);
  chara.rightFoot = renderFoot(RIGHT_FOOT_FRONT_X, RIGHT_FOOT_FRONT_Y);
  chara.leftHand = renderHand(0, 0, -1);
  chara.trunk = renderTrunk(chara.unit.class, TRUNK_FRONT_X, TRUNK_FRONT_Y);
  chara.head = renderHead(HEAD_FRONT_X, HEAD_FRONT_Y);
  chara.hair = renderHair(HEAD_FRONT_X, HEAD_FRONT_Y);
  chara.hat = renderHat(HEAD_FRONT_X, HEAD_FRONT_Y);
  chara.rightHand = renderHand(0, 0, 1);

  chara.mainHandContainer = chara.add.container(
    RIGHT_HAND_FRONT_X,
    RIGHT_HAND_FRONT_Y,
  );

  chara.offHandContainer = chara.add.container(
    LEFT_HAND_FRONT_X,
    LEFT_HAND_FRONT_Y,
  );

  chara.container?.add(chara.mainHandContainer);
  chara.container?.add(chara.offHandContainer);
  chara.mainHandContainer.add(chara.rightHand);
  chara.offHandContainer.add(chara.leftHand);

  if (chara.unit.class === 'mage') {
    chara.rightHandEquip = chara.add.image(
      23,
      17,
      `equips/${chara.unit.equips.mainHand}`,
    );

    chara.rightHandEquip.setScale(-0.3, 0.3);
    chara.rightHandEquip.setOrigin(0.45, 0.7);
    chara.rightHandEquip.setRotation(-0.2);
    chara.rightHandEquip.setPosition(3, 17);

    chara.mainHandContainer.add(chara.rightHandEquip);
    chara.mainHandContainer.sendToBack(chara.rightHandEquip);
  } else if (chara.unit.class === 'fighter') {

    chara.rightHandEquip = chara.add.image(
      23,
      17,
      `equips/${chara.unit.equips.mainHand}`,
    );

    chara.rightHandEquip.setScale(0.2);
    chara.rightHandEquip.setOrigin(1, 1);

    chara.mainHandContainer.add(chara.rightHandEquip);
    chara.mainHandContainer.sendToBack(chara.rightHandEquip);
  } else if (chara.unit.class === 'archer') {
    chara.leftHandEquip = chara.add.image(
      0,
      0,
      `equips/${chara.unit.equips.mainHand}`,
    );

    chara.offHandContainer.add(chara.leftHandEquip);
    chara.offHandContainer.sendToBack(chara.leftHandEquip);
    chara.leftHand.setPosition(5, 0);
    chara.offHandContainer.sendToBack(chara.leftHandEquip);
  }
    // if (chara.unit.equips.mainHand === 'iron_spear') {
  //   chara.rightHandEquip.setPosition(60, -10);
  //   chara.rightHandEquip.setScale(-1, 1);
  //   chara.rightHandEquip.setOrigin(0.5);
  //   chara.rightHandEquip.setRotation(0.5);
  //   chara.rightHand.setPosition(-2, 10);
  //   chara.leftHand.setPosition(5, 10);
  // }
  //
  chara.container.sendToBack(chara.offHandContainer);
}
function back(scene: Chara) {
  const {skinColor, hair, hairColor} = scene.unit.style;
  const renderHair = (gx: number, gy: number) => {
    if (scene.unit.equips.head !== 'none') return null;

    const hairSprite = scene.add.image(gx, gy, 'back_' + hair);
    hairSprite.setTint(hairColor);
    scene.container?.add(hairSprite);
    return hairSprite;
  };

  function renderHead(gx: number, gy: number) {
    const head = scene.add.image(gx, gy, 'back_head');
    head.setTint(skinColor);
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

    hand.setTint(skinColor);
    scene.container?.add(hand);
    return hand;
  }

  function renderHat(x: number, y: number) {
    if (scene.unit.equips.head === 'none') return null;

    const hat = scene.add.image(x, y, `equips/back_${scene.unit.equips.head}`);

    scene.container?.add(hat);
    return hat;
  }

  scene.mainHandContainer = scene.add.container(
    RIGHT_HAND_BACK_X,
    RIGHT_HAND_BACK_Y,
  );
  scene.container?.add(scene.mainHandContainer);

  scene.offHandContainer = scene.add.container(
    LEFT_HAND_BACK_X,
    LEFT_HAND_BACK_Y,
  );
  scene.container?.add(scene.offHandContainer);

  scene.rightHandEquip = scene.add.image(
    -10,
    20,
    `equips/${scene.unit.equips.mainHand}`,
  );
  scene.mainHandContainer.add(scene.rightHandEquip);
  scene.rightHandEquip.setScale(-0.2, 0.2);
  scene.rightHandEquip.setOrigin(1, 1);

  scene.rightHand = renderHand(12, 16);
  scene.rightHand.setOrigin(0.5);
  scene.rightHand.setScale(-1, 1);
  scene.rightHand.setRotation(1.6);
  scene.mainHandContainer.add(scene.rightHand);

  scene.rightFoot = renderFoot(RIGHT_FOOT_BACK_X, RIGHT_FOOT_BACK_Y);
  scene.rightFoot.scaleY = -1;
  scene.leftFoot = renderFoot(LEFT_FOOT_BACK_X, LEFT_FOOT_BACK_Y);
  scene.leftFoot.scaleY = -1;

  scene.trunk = renderTrunk(scene.unit.class, TRUNK_BACK_X, TRUNK_BACK_Y);
  scene.head = renderHead(HEAD_BACK_X, HEAD_BACK_Y);
  scene.hair = renderHair(HEAD_FRONT_X, HEAD_FRONT_Y);
  scene.leftHand = renderHand(LEFT_HAND_BACK_X, LEFT_HAND_BACK_Y);
  scene.hat = renderHat(HEAD_BACK_X, HEAD_BACK_Y);
}

export default (chara: Chara) => {
  if (chara.front) front(chara);
  else back(chara);
};
