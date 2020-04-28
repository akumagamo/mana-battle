import {Chara} from '../Chara';
import {LEFT_FOOT_FRONT_X, LEFT_FOOT_FRONT_Y, RIGHT_FOOT_FRONT_Y, RIGHT_FOOT_FRONT_X, LEFT_HAND_FRONT_X, LEFT_HAND_FRONT_Y, TRUNK_FRONT_X, TRUNK_FRONT_Y, HEAD_FRONT_Y, HEAD_FRONT_X, RIGHT_HAND_FRONT_X, RIGHT_HAND_FRONT_Y, RIGHT_HAND_BACK_X, RIGHT_HAND_BACK_Y} from './constants';

function front(scene: Chara) {
  const renderHead = (gx: number, gy: number) => {
    const head = scene.add.image(gx, gy, 'head' + scene.unit.style.head.toString());
    scene.container?.add(head);
    return head;
  };

  const renderFoot = (footX: number, footY: number) => {
    const foot = scene.add.image(footX, footY, 'foot');
    scene.container?.add(foot);
    return foot;
  };

  const renderTrunk = (trunkX: number, trunkY: number) => {
    const trunk = scene.add.image(
      trunkX,
      trunkY,
      'trunk' + scene.unit.style.trunk.toString(),
    );

    scene.container?.add(trunk);

    return trunk;
  };

  const renderHand = (handX: number, handY: number, scaleX: number) => {
    const hand = scene.add.image(handX, handY, 'hand');
    hand.scaleX = scaleX;
    scene.container?.add(hand);
    return hand;
  };

  scene.leftFoot = renderFoot(LEFT_FOOT_FRONT_X, LEFT_FOOT_FRONT_Y);
  scene.rightFoot = renderFoot(RIGHT_FOOT_FRONT_X, RIGHT_FOOT_FRONT_Y);
  scene.leftHand = renderHand(LEFT_HAND_FRONT_X, LEFT_HAND_FRONT_Y, -1);
  scene.trunk = renderTrunk(TRUNK_FRONT_X, TRUNK_FRONT_Y);
  scene.head = renderHead(HEAD_FRONT_X, HEAD_FRONT_Y);

  scene.rightHand = renderHand(0, 4, 1);
  scene.rightHand.setRotation(-1.9);
  scene.mainHandContainer = scene.add.container(
    RIGHT_HAND_FRONT_X,
    RIGHT_HAND_FRONT_Y,
  );
  scene.container?.add(scene.mainHandContainer);
  scene.mainHandContainer.add(scene.rightHand);

  scene.mainHand = scene.add.image(10, 10, scene.unit.equips.mainHand);
  scene.mainHandContainer.add(scene.mainHand);
  scene.mainHand.setScale(0.2);
  scene.mainHand.setOrigin(1, 1);
}
function back(scene: Chara) {
  function renderHead(gx: number, gy: number) {
    const head = scene.add.image(
      gx,
      gy,
      'back_head' + scene.unit.style.head.toString(),
    );
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

  function renderTrunk(trunkX: number, trunkY: number) {
    const trunk = scene.add.image(
      trunkX,
      trunkY,
      'back_trunk' + scene.unit.style.trunk.toString(),
    );

    scene.container?.add(trunk);

    return trunk;
  }

  function renderHand(handX: number, handY: number) {
    const hand = scene.add.image(handX, handY, 'hand');

    scene.container?.add(hand);
    return hand;
  }

  scene.rightHand = renderHand(35, 55);
  scene.rightHand.setRotation(-1.9);
  scene.rightHand.scaleX = scene.rightHand.scaleX * -1;

  scene.mainHandContainer = scene.add.container(
    RIGHT_HAND_BACK_X,
    RIGHT_HAND_BACK_Y,
  );
  scene.container?.add(scene.mainHandContainer);
  scene.mainHandContainer.add(scene.rightHand);

  scene.mainHand = scene.add.image(10, 10, scene.unit.equips.mainHand);
  scene.mainHandContainer.add(scene.mainHand);
  scene.mainHand.setScale(0.2);
  scene.mainHand.setOrigin(1, 1);

  scene.rightFoot = renderFoot(10, 90);
  scene.leftFoot = renderFoot(-10, 97);

  scene.trunk = renderTrunk(0, 55);
  scene.head = renderHead(0, 0);
  scene.leftHand = renderHand(-30, 60);
}

export default (chara: Chara) => {
  if (chara.front) front(chara);
  else back(chara);
};
