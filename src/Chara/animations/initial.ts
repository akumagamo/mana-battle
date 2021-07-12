import { Gender } from '../../Unit/Model';
import { Chara } from '../Model';
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

const shouldRenderHair = (chara: Chara) =>
  !chara.props.unit.style.displayHat || chara.props.unit.equips.head === 'none';

const shouldRenderHat = (chara: Chara) =>
  chara.props.unit.style.displayHat && chara.props.unit.equips.head !== 'none';

function front(chara: Chara, headOnly = false) {
  const { skinColor, hair, hairColor } = chara.props.unit.style;
  const renderHair = (gx: number, gy: number) => {
    if (!shouldRenderHair(chara)) return null;
    const hairSprite = chara.scene.add.image(gx, gy, hair);
    hairSprite.setTint(hairColor);
    chara.innerWrapper.add(hairSprite);
    return hairSprite;
  };
  const renderHead = (gx: number, gy: number, gender: Gender) => {
    const head = chara.scene.add.image(gx, gy, `chara/head_${gender}`);
    head.setTint(skinColor);
    chara.innerWrapper.add(head);
    return head;
  };

  const renderFoot = (footX: number, footY: number) => {
    const foot = chara.scene.add.image(footX, footY, 'foot');
    chara.innerWrapper.add(foot);
    return foot;
  };

  const renderTrunk = (class_: string, trunkX: number, trunkY: number) => {
    const trunk = chara.scene.add.image(trunkX, trunkY, `trunk_${class_}`);

    chara.innerWrapper.add(trunk);

    return trunk;
  };

  const renderHand = (handX: number, handY: number) => {
    const hand = chara.scene.add.image(handX, handY, 'hand');
    hand.setTint(skinColor);
    chara.innerWrapper.add(hand);
    return hand;
  };

  function renderHat(x: number, y: number) {
    if (!shouldRenderHat(chara)) return null;

    const hat = chara.scene.add.image(
      x,
      y,
      `equips/${chara.props.unit.equips.head}`
    );

    chara.innerWrapper.add(hat);
    return hat;
  }

  chara.head = renderHead(HEAD_FRONT_X, HEAD_FRONT_Y, chara.props.unit.gender);
  chara.hair = renderHair(HEAD_FRONT_X, HEAD_FRONT_Y);
  chara.hat = renderHat(HEAD_FRONT_X, HEAD_FRONT_Y);

  if (headOnly) return;

  chara.leftFoot = renderFoot(LEFT_FOOT_FRONT_X, LEFT_FOOT_FRONT_Y);
  chara.rightFoot = renderFoot(RIGHT_FOOT_FRONT_X, RIGHT_FOOT_FRONT_Y);
  if (chara.props.unit.class === 'mage') {
    chara.leftFoot.visible = false;
    chara.rightFoot.visible = false;
  }

  chara.leftHand = renderHand(0, 0);
  chara.trunk = renderTrunk(
    chara.props.unit.class,
    TRUNK_FRONT_X,
    TRUNK_FRONT_Y
  );
  chara.rightHand = renderHand(0, 0);

  chara.mainHandContainer = chara.scene.add.container(
    RIGHT_HAND_FRONT_X,
    RIGHT_HAND_FRONT_Y
  );

  chara.offHandContainer = chara.scene.add.container(
    LEFT_HAND_FRONT_X,
    LEFT_HAND_FRONT_Y
  );

  chara.innerWrapper.add(chara.mainHandContainer);
  chara.innerWrapper.add(chara.offHandContainer);
  chara.mainHandContainer.add(chara.rightHand);
  chara.offHandContainer.add(chara.leftHand);

  if (chara.props.showWeapon) renderFrontWeapon(chara);

  chara.innerWrapper.sendToBack(chara.offHandContainer);
  chara.innerWrapper.bringToTop(chara.head);
  if (chara.hair) chara.innerWrapper.bringToTop(chara.hair);
  if (chara.hat) chara.innerWrapper.bringToTop(chara.hat);

  chara.innerWrapper.bringToTop(chara.mainHandContainer);
}
function renderFrontWeapon(chara: Chara) {
  if (chara.props.unit.class === 'mage') {
    chara.rightHandEquip = chara.scene.add.image(
      23,
      17,
      `equips/${chara.props.unit.equips.mainHand}`
    );

    chara.rightHandEquip.setScale(-0.3, 0.3);
    chara.rightHandEquip.setOrigin(0.45, 0.7);
    chara.rightHandEquip.setRotation(-0.2);
    chara.rightHandEquip.setPosition(3, 17);

    chara.mainHandContainer.add(chara.rightHandEquip);
    chara.mainHandContainer.sendToBack(chara.rightHandEquip);
  } else if (chara.props.unit.class === 'fighter') {
    chara.rightHandEquip = chara.scene.add.image(
      23,
      17,
      `equips/${chara.props.unit.equips.mainHand}`
    );

    chara.rightHandEquip.setScale(0.2);
    chara.rightHandEquip.setOrigin(1, 1);

    chara.mainHandContainer.add(chara.rightHandEquip);
    chara.mainHandContainer.sendToBack(chara.rightHandEquip);
  } else if (chara.props.unit.class === 'archer') {
    chara.leftHandEquip = chara.scene.add.image(
      0,
      0,
      `equips/${chara.props.unit.equips.mainHand}`
    );

    chara.offHandContainer.add(chara.leftHandEquip);
    chara.offHandContainer.sendToBack(chara.leftHandEquip);
    chara.leftHand.setPosition(5, 0);
    chara.offHandContainer.sendToBack(chara.leftHandEquip);
  }
}

function back(chara: Chara, headOnly = false) {
  const { skinColor, hair, hairColor } = chara.props.unit.style;
  const renderHair = (gx: number, gy: number) => {
    if (!shouldRenderHair(chara)) return null;

    const hairSprite = chara.scene.add.image(gx, gy, 'back_' + hair);
    hairSprite.setTint(hairColor);
    chara.innerWrapper.add(hairSprite);
    return hairSprite;
  };

  function renderHead(gx: number, gy: number) {
    const head = chara.scene.add.image(gx, gy, 'back_head');
    head.setTint(skinColor);
    chara.innerWrapper.add(head);

    return head;
  }

  function renderFoot(footX: number, footY: number) {
    const foot = chara.scene.add.image(footX, footY, 'foot');

    foot.scaleX = -1;
    foot.rotation = 0.6;
    chara.innerWrapper.add(foot);

    return foot;
  }

  function renderTrunk(class_: string, trunkX: number, trunkY: number) {
    const trunk = chara.scene.add.image(trunkX, trunkY, `trunk_back_${class_}`);

    chara.innerWrapper.add(trunk);

    return trunk;
  }

  function renderHand(handX: number, handY: number) {
    const hand = chara.scene.add.image(handX, handY, 'hand');

    hand.setTint(skinColor);
    chara.innerWrapper.add(hand);
    return hand;
  }

  function renderHat(x: number, y: number) {
    if (!shouldRenderHat(chara)) return null;

    const hat = chara.scene.add.image(
      x,
      y,
      `equips/back_${chara.props.unit.equips.head}`
    );

    chara.innerWrapper.add(hat);
    return hat;
  }

  chara.mainHandContainer = chara.scene.add.container(
    RIGHT_HAND_BACK_X,
    RIGHT_HAND_BACK_Y
  );

  chara.innerWrapper.add(chara.mainHandContainer);

  chara.head = renderHead(HEAD_BACK_X, HEAD_BACK_Y);
  chara.hair = renderHair(HEAD_FRONT_X, HEAD_FRONT_Y);
  chara.hat = renderHat(HEAD_BACK_X, HEAD_BACK_Y);

  if (headOnly) return;

  chara.leftFoot = renderFoot(LEFT_FOOT_BACK_X, LEFT_FOOT_BACK_Y);
  chara.rightFoot = renderFoot(RIGHT_FOOT_BACK_X, RIGHT_FOOT_BACK_Y);

  chara.leftFoot.setScale(1, 1);
  chara.rightFoot.setScale(1, 1);

  if (chara.props.unit.class === 'mage') {
    chara.leftFoot.visible = false;
    chara.rightFoot.visible = false;
  }
  chara.leftHand = renderHand(0, 0);
  chara.trunk = renderTrunk(chara.props.unit.class, TRUNK_BACK_X, TRUNK_BACK_Y);
  chara.rightHand = renderHand(0, 0);

  chara.offHandContainer = chara.scene.add.container(
    LEFT_HAND_BACK_X,
    LEFT_HAND_BACK_Y
  );

  chara.innerWrapper.add(chara.offHandContainer);
  chara.mainHandContainer.add(chara.rightHand);
  chara.offHandContainer.add(chara.leftHand);

  if (chara.props.showWeapon) {
    renderBackWeapon(chara);
  }

  chara.innerWrapper.bringToTop(chara.head);

  if (chara.hair) chara.innerWrapper.bringToTop(chara.hair);
  if (chara.hat) chara.innerWrapper.bringToTop(chara.hat);

  chara.innerWrapper.sendToBack(chara.mainHandContainer);

  chara.innerWrapper.bringToTop(chara.offHandContainer);
}

export default (chara: Chara, headOnly = false) => {
  if (chara.props.front) front(chara, headOnly);
  else back(chara, headOnly);
};

function renderBackWeapon(chara: Chara) {
  if (chara.props.unit.class === 'mage') {
    chara.rightHandEquip = chara.scene.add.image(
      13,
      17,
      `equips/${chara.props.unit.equips.mainHand}`
    );

    chara.rightHandEquip.setScale(-0.3, 0.3);
    chara.rightHandEquip.setOrigin(0.45, 0.7);
    chara.rightHandEquip.setRotation(-0.2);
    chara.rightHandEquip.setPosition(3, 17);

    chara.mainHandContainer.add(chara.rightHandEquip);
    chara.mainHandContainer.sendToBack(chara.rightHandEquip);
  } else if (chara.props.unit.class === 'fighter') {
    chara.rightHandEquip = chara.scene.add.image(
      -10,
      15,
      `equips/${chara.props.unit.equips.mainHand}`
    );

    chara.rightHandEquip.setScale(-0.2, 0.2);
    chara.rightHandEquip.setOrigin(1, 1);

    chara.mainHandContainer.add(chara.rightHandEquip);
    chara.mainHandContainer.sendToBack(chara.rightHandEquip);
  } else if (chara.props.unit.class === 'archer') {
    chara.leftHandEquip = chara.scene.add.image(
      0,
      20,
      `equips/${chara.props.unit.equips.mainHand}`
    );
    chara.leftHandEquip.rotation = 1;

    chara.offHandContainer.add(chara.leftHandEquip);
    chara.offHandContainer.sendToBack(chara.leftHandEquip);
    chara.leftHand.setPosition(5, 0);
    chara.offHandContainer.sendToBack(chara.leftHandEquip);
    chara.offHandContainer.sendToBack(chara.leftHandEquip);
  }
}
