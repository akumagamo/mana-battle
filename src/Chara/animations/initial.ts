import { Gender } from "../../Unit/Model";
import { Chara } from "../Chara";
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
} from "./constants";

const shouldRenderHair = (chara: Chara) =>
  !chara.unit.style.displayHat || chara.unit.equips.head === "none";

const shouldRenderHat = (chara: Chara) =>
  chara.unit.style.displayHat && chara.unit.equips.head !== "none";

function front(chara: Chara, headOnly = false) {
  const { skinColor, hair, hairColor } = chara.unit.style;
  const renderHair = (gx: number, gy: number) => {
    if (!shouldRenderHair(chara)) return null;
    const hairSprite = chara.add.image(gx, gy, hair);
    hairSprite.setTint(hairColor);
    chara.container?.add(hairSprite);
    return hairSprite;
  };
  const renderHead = (gx: number, gy: number, gender: Gender) => {
    const head = chara.add.image(gx, gy, `chara/head_${gender}`);
    head.setTint(skinColor);
    chara.container?.add(head);
    return head;
  };

  const renderFoot = (footX: number, footY: number) => {
    const foot = chara.add.image(footX, footY, "foot");
    chara.container?.add(foot);
    return foot;
  };

  const renderTrunk = (class_: string, trunkX: number, trunkY: number) => {
    const trunk = chara.add.image(trunkX, trunkY, `trunk_${class_}`);

    chara.container?.add(trunk);

    return trunk;
  };

  const renderHand = (handX: number, handY: number) => {
    const hand = chara.add.image(handX, handY, "hand");
    hand.setTint(skinColor);
    chara.container?.add(hand);
    return hand;
  };

  function renderHat(x: number, y: number) {
    if (!shouldRenderHat(chara)) return null;

    const hat = chara.add.image(x, y, `equips/${chara.unit.equips.head}`);

    chara.container?.add(hat);
    return hat;
  }

  chara.head = renderHead(HEAD_FRONT_X, HEAD_FRONT_Y, chara.unit.gender);
  chara.hair = renderHair(HEAD_FRONT_X, HEAD_FRONT_Y);
  chara.hat = renderHat(HEAD_FRONT_X, HEAD_FRONT_Y);

  if (headOnly) return;

  chara.leftFoot = renderFoot(LEFT_FOOT_FRONT_X, LEFT_FOOT_FRONT_Y);
  chara.rightFoot = renderFoot(RIGHT_FOOT_FRONT_X, RIGHT_FOOT_FRONT_Y);
  if (chara.unit.class === "mage") {
    chara.leftFoot.visible = false;
    chara.rightFoot.visible = false;
  }

  chara.leftHand = renderHand(0, 0);
  chara.trunk = renderTrunk(chara.unit.class, TRUNK_FRONT_X, TRUNK_FRONT_Y);
  chara.rightHand = renderHand(0, 0);

  chara.mainHandContainer = chara.add.container(
    RIGHT_HAND_FRONT_X,
    RIGHT_HAND_FRONT_Y
  );

  chara.offHandContainer = chara.add.container(
    LEFT_HAND_FRONT_X,
    LEFT_HAND_FRONT_Y
  );

  chara.container?.add(chara.mainHandContainer);
  chara.container?.add(chara.offHandContainer);
  chara.mainHandContainer.add(chara.rightHand);
  chara.offHandContainer.add(chara.leftHand);

  if (chara.showWeapon) renderFrontWeapon(chara);

  chara.container.sendToBack(chara.offHandContainer);
  chara.container?.bringToTop(chara.head);
  if (chara.hair) chara.container?.bringToTop(chara.hair);
  if (chara.hat) chara.container?.bringToTop(chara.hat);

  chara.container.bringToTop(chara.mainHandContainer);
}
function renderFrontWeapon(chara: Chara) {
  if (chara.unit.class === "mage") {
    chara.rightHandEquip = chara.add.image(
      23,
      17,
      `equips/${chara.unit.equips.mainHand}`
    );

    chara.rightHandEquip.setScale(-0.3, 0.3);
    chara.rightHandEquip.setOrigin(0.45, 0.7);
    chara.rightHandEquip.setRotation(-0.2);
    chara.rightHandEquip.setPosition(3, 17);

    chara.mainHandContainer.add(chara.rightHandEquip);
    chara.mainHandContainer.sendToBack(chara.rightHandEquip);
  } else if (chara.unit.class === "fighter") {
    chara.rightHandEquip = chara.add.image(
      23,
      17,
      `equips/${chara.unit.equips.mainHand}`
    );

    chara.rightHandEquip.setScale(0.2);
    chara.rightHandEquip.setOrigin(1, 1);

    chara.mainHandContainer.add(chara.rightHandEquip);
    chara.mainHandContainer.sendToBack(chara.rightHandEquip);
  } else if (chara.unit.class === "archer") {
    chara.leftHandEquip = chara.add.image(
      0,
      0,
      `equips/${chara.unit.equips.mainHand}`
    );

    chara.offHandContainer.add(chara.leftHandEquip);
    chara.offHandContainer.sendToBack(chara.leftHandEquip);
    chara.leftHand.setPosition(5, 0);
    chara.offHandContainer.sendToBack(chara.leftHandEquip);
  }
}

function back(chara: Chara, headOnly = false) {
  const { skinColor, hair, hairColor } = chara.unit.style;
  const renderHair = (gx: number, gy: number) => {
    if (!shouldRenderHair(chara)) return null;

    const hairSprite = chara.add.image(gx, gy, "back_" + hair);
    hairSprite.setTint(hairColor);
    chara.container?.add(hairSprite);
    return hairSprite;
  };

  function renderHead(gx: number, gy: number) {
    const head = chara.add.image(gx, gy, "back_head");
    head.setTint(skinColor);
    chara.container?.add(head);

    return head;
  }

  function renderFoot(footX: number, footY: number) {
    const foot = chara.add.image(footX, footY, "foot");

    foot.scaleX = -1;
    foot.rotation = 0.6;
    chara.container?.add(foot);

    return foot;
  }

  function renderTrunk(class_: string, trunkX: number, trunkY: number) {
    const trunk = chara.add.image(trunkX, trunkY, `trunk_back_${class_}`);

    chara.container?.add(trunk);

    return trunk;
  }

  function renderHand(handX: number, handY: number) {
    const hand = chara.add.image(handX, handY, "hand");

    hand.setTint(skinColor);
    chara.container?.add(hand);
    return hand;
  }

  function renderHat(x: number, y: number) {
    if (!shouldRenderHat(chara)) return null;

    const hat = chara.add.image(x, y, `equips/back_${chara.unit.equips.head}`);

    chara.container?.add(hat);
    return hat;
  }

  chara.mainHandContainer = chara.add.container(
    RIGHT_HAND_BACK_X,
    RIGHT_HAND_BACK_Y
  );

  chara.container?.add(chara.mainHandContainer);

  chara.head = renderHead(HEAD_BACK_X, HEAD_BACK_Y);
  chara.hair = renderHair(HEAD_FRONT_X, HEAD_FRONT_Y);
  chara.hat = renderHat(HEAD_BACK_X, HEAD_BACK_Y);

  if (headOnly) return;

  chara.leftFoot = renderFoot(LEFT_FOOT_BACK_X, LEFT_FOOT_BACK_Y);
  chara.rightFoot = renderFoot(RIGHT_FOOT_BACK_X, RIGHT_FOOT_BACK_Y);

  chara.leftFoot.setScale(1, 1);
  chara.rightFoot.setScale(1, 1);

  if (chara.unit.class === "mage") {
    chara.leftFoot.visible = false;
    chara.rightFoot.visible = false;
  }
  chara.leftHand = renderHand(0, 0);
  chara.trunk = renderTrunk(chara.unit.class, TRUNK_BACK_X, TRUNK_BACK_Y);
  chara.rightHand = renderHand(0, 0);

  chara.offHandContainer = chara.add.container(
    LEFT_HAND_BACK_X,
    LEFT_HAND_BACK_Y
  );

  chara.container?.add(chara.offHandContainer);
  chara.mainHandContainer.add(chara.rightHand);
  chara.offHandContainer.add(chara.leftHand);

  if (chara.showWeapon) {
    renderBackWeapon(chara);
  }

  chara.container?.bringToTop(chara.head);

  if (chara.hair) chara.container?.bringToTop(chara.hair);
  if (chara.hat) chara.container?.bringToTop(chara.hat);

  chara.container?.sendToBack(chara.mainHandContainer);

  chara.container.bringToTop(chara.offHandContainer);
}

export default (chara: Chara, headOnly = false) => {
  if (chara.front) front(chara, headOnly);
  else back(chara, headOnly);
};

function renderBackWeapon(chara: Chara) {
  if (chara.unit.class === "mage") {
    chara.rightHandEquip = chara.add.image(
      13,
      17,
      `equips/${chara.unit.equips.mainHand}`
    );

    chara.rightHandEquip.setScale(-0.3, 0.3);
    chara.rightHandEquip.setOrigin(0.45, 0.7);
    chara.rightHandEquip.setRotation(-0.2);
    chara.rightHandEquip.setPosition(3, 17);

    chara.mainHandContainer.add(chara.rightHandEquip);
    chara.mainHandContainer.sendToBack(chara.rightHandEquip);
  } else if (chara.unit.class === "fighter") {
    chara.rightHandEquip = chara.add.image(
      -10,
      15,
      `equips/${chara.unit.equips.mainHand}`
    );

    chara.rightHandEquip.setScale(-0.2, 0.2);
    chara.rightHandEquip.setOrigin(1, 1);

    chara.mainHandContainer.add(chara.rightHandEquip);
    chara.mainHandContainer.sendToBack(chara.rightHandEquip);
  } else if (chara.unit.class === "archer") {
    chara.leftHandEquip = chara.add.image(
      0,
      20,
      `equips/${chara.unit.equips.mainHand}`
    );
    chara.leftHandEquip.rotation = 1;

    chara.offHandContainer.add(chara.leftHandEquip);
    chara.offHandContainer.sendToBack(chara.leftHandEquip);
    chara.leftHand.setPosition(5, 0);
    chara.offHandContainer.sendToBack(chara.leftHandEquip);
    chara.offHandContainer.sendToBack(chara.leftHandEquip);
  }
}
