import * as Phaser from 'phaser';

import {Unit, AnimatedUnit} from '../Unit/Model';
import {animate} from './animations/animate';
import {Container, Pointer, Image} from '../Models';
import {INVALID_STATE} from '../errors';
import {getItem} from '../DB';

const CHARA_WRAPPER_X = 0;
const CHARA_WRAPPER_Y = 0;
const HEAD_FRONT_X = 0;
const HEAD_FRONT_Y = 0;
const LEFT_FOOT_FRONT_X = 20;
const LEFT_FOOT_FRONT_Y = 90;
const RIGHT_FOOT_FRONT_X = -10;
const RIGHT_FOOT_FRONT_Y = 97;
const TRUNK_FRONT_X = 0;
const TRUNK_FRONT_Y = 55;
const LEFT_HAND_FRONT_X = 35;
const LEFT_HAND_FRONT_Y = 55;
const RIGHT_HAND_FRONT_X = -30;
const RIGHT_HAND_FRONT_Y = 60;


const RIGHT_HAND_BACK_X = 100;
const RIGHT_HAND_BACK_Y = 60;
const LEFT_HAND_BACK_X = -30
const LEFT_HAND_BACK_Y = 40



export class Chara extends Phaser.Scene {
  container: Container | null = null;
  charaWrapper: Container | null = null;

  //body parts

  head: Image | null = null;
  trunk: Image | null = null;
  leftHand: Image | null = null;
  rightHand: Image | null = null;
  leftFoot: Image | null = null;
  rightFoot: Image | null = null;

  mainHandContainer: Container | null = null;

  //Equips
  mainHand: Image | null = null;

  constructor(
    public key: string,
    public parent: Phaser.Scene,
    public unit: Unit,
    public cx: number,
    public cy: number,
    public scaleSizing: number, // todo: rename
    public front: boolean,
  ) {
    super(key);

    parent.scene.add(key, this, true);
    return this;
  }
  create() {
    this.charaWrapper = this.add.container(CHARA_WRAPPER_X, CHARA_WRAPPER_Y);

    this.container = this.add.container(this.cx, this.cy);
    this.charaWrapper.add(this.container);

    this.container.setDepth(this.cy);

    const animatedUnit = animate(this.unit, this.container);

    if (this.front) {
      renderFrontCharacter(this, animatedUnit);
    } else {
      renderBackCharacter(this, animatedUnit);
    }

    this.maybeRenderInsignea();

    const container_width = 100;
    const container_height = 170;

    this.container.setSize(container_width, container_height);

    // DEBUG DRAG CONTAINER
    //var rect = new Phaser.Geom.Rectangle(
    //  (-1 * container_width) / 2,
    //  (-1 * container_height) / 2,
    //  container_width,
    //  container_height,
    //);
    //
    //var graphics = this.add.graphics({fillStyle: {color: 0x0000ff}});
    //graphics.alpha = 0.5;
    //
    //graphics.fillRectShape(rect);
    //this.container.add(graphics);

    this.container.scale = this.scaleSizing;

    animatedUnit.container = this.container;
    this.container.name = animatedUnit.id;

    const name = this.add.text(0, 100, this.unit.name, {color: '#000'});
    this.container.add(name);
  }

  private maybeRenderInsignea() {
    if (this.unit.leader && this.container) {
      const insignea = this.add.image(50, 0, 'insignea');
      this.container.add(insignea);
    }
  }

  onClick(fn: (chara: Chara) => void) {
    if (!this.container) return;

    this.container.setInteractive();

    this.container.on('pointerdown', (_pointer: Pointer) => {
      fn(this);
    });
  }

  enableDrag(
    dragStart: (unit: Unit, x: number, y: number, chara: Chara) => void,
    dragEnd: (unit: Unit, x: number, y: number, chara: Chara) => void,
  ) {
    if (!this.container) return;

    this.container.setInteractive();
    this.input.setDraggable(this.container);

    this.input.on(
      'drag',
      (_pointer: Pointer, obj: Container, x: number, y: number) => {
        if (this.container) {
          this.container.setDepth(Infinity);
        }

        obj.x = x;
        obj.y = y;

        dragStart(this.unit, x, y, this);
      },
    );

    this.container.on(
      'dragend',
      (_pointer: Pointer, _dragX: number, dragY: number) => {
        if (this.container) {
          this.container.setDepth(dragY);
        }
        dragEnd(
          this.unit,
          this.container?.x || 0,
          this.container?.y || 0,
          this,
        );
      },
    );
  }

  handleClick(fn: (chara: Chara, pointer: Pointer) => void) {
    this.container?.on('pointerdown', (pointer: Pointer) => {
      fn(this, pointer);
    });
  }

  // ANIMATIONS

  clearAnimations() {
    this.tweens.killAll(); 
    if (
      !this.head ||
      !this.trunk ||
      !this.leftHand ||
      !this.mainHandContainer ||
      !this.leftFoot ||
      !this.rightFoot ||
      !this.charaWrapper
    ){
      throw new Error(INVALID_STATE)
    }

    this.charaWrapper.x = CHARA_WRAPPER_X;
    this.charaWrapper.y = CHARA_WRAPPER_Y;
    this.head.x = HEAD_FRONT_X;
    this.head.y = HEAD_FRONT_Y;
    this.leftFoot.x = LEFT_FOOT_FRONT_X;
    this.leftFoot.y = LEFT_FOOT_FRONT_Y;
    this.rightFoot.x = RIGHT_FOOT_FRONT_X;
    this.rightFoot.y = RIGHT_FOOT_FRONT_Y;
    this.leftHand.x = LEFT_HAND_FRONT_X;
    this.leftHand.y = LEFT_HAND_FRONT_Y;
    this.mainHandContainer.x = RIGHT_HAND_FRONT_X;
    this.mainHandContainer.y = RIGHT_HAND_FRONT_Y;
  }

  standFront() {
    this.clearAnimations();

    this.tweens.add({
      targets: this.head,
      y: HEAD_FRONT_Y - 2,
      duration: 1600,
      yoyo: true,
      repeat: -1,
    });

    this.tweens.add({
      targets: this.trunk,
      y: TRUNK_FRONT_Y + 2,
      duration: 1600,
      yoyo: true,
      repeat: -1,
    });

    this.tweens.add({
      targets: this.leftHand,
      y: LEFT_HAND_FRONT_Y + 8,
      duration: 1600,
      yoyo: true,
      repeat: -1,
    });

    this.tweens.add({
      targets: this.mainHandContainer,
      y: RIGHT_HAND_FRONT_Y - 4,
      duration: 1600,
      yoyo: true,
      repeat: -1,
    });
  }

  attack(onComplete: () => void) {

    this.clearAnimations()
    const ATTACK_DURATION = 250;
    //this.mainHandContainer?.setRotation(-0.3)

    this.parent.tweens.add({
      targets: this?.mainHandContainer,
      rotation:  1.9,
      yoyo: true,
      x: RIGHT_HAND_FRONT_X + 30,
      Y : RIGHT_HAND_FRONT_Y - 20,
      duration: ATTACK_DURATION,
      ease: 'Expo',
      onComplete: () => {
        onComplete();
      },
    });
  }

  flinch() {
    const FLINCH_DURATION = 500;

    this.parent.tweens.add({
      targets: this?.container,
      rotation: 0.15,
      yoyo: true,
      duration: FLINCH_DURATION,
    });
  }

  run() {
    this.clearAnimations();

    this.add.tween({
      targets: this.leftFoot,
      x: LEFT_FOOT_FRONT_X - 20,
      yoyo: true,
      rotation: -0.2,
      repeat: -1,
      duration: 500,
    });

    this.add.tween({
      targets: this.rightFoot,
      x: RIGHT_FOOT_FRONT_X + 10,
      yoyo: true,
      rotation: -0.2,
      repeat: -1,
      duration: 500,
    });

    this.add.tween({
      targets: this.leftHand,
      x: LEFT_HAND_FRONT_X + 10,
      yoyo: true,
      rotation: -0.2,
      repeat: -1,
      duration: 500,
    });

    this.add.tween({
      targets: this.mainHandContainer,
      x: RIGHT_HAND_FRONT_X - 10,
      yoyo: true,
      rotation: -0.2,
      repeat: -1,
      duration: 500,
    });

    this.add.tween({
      targets: this.charaWrapper,
      y: CHARA_WRAPPER_Y - 20,
      yoyo: true,
      repeat: -1,
      duration: 100,
    });
  }
}

function renderFrontCharacter(scene: Chara, unit: AnimatedUnit) {
  const renderHead = (gx: number, gy: number) => {
    const head = scene.add.image(gx, gy, 'head' + unit.style.head.toString());
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
      'trunk' + unit.style.trunk.toString(),
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
  
  scene.rightHand = renderHand(0,4,1);
  scene.rightHand.setRotation(-1.9)
  scene.mainHandContainer = scene.add.container(RIGHT_HAND_FRONT_X, RIGHT_HAND_FRONT_Y)
  scene.container?.add(scene.mainHandContainer)
  scene.mainHandContainer.add(scene.rightHand)

  scene.mainHand = scene.add.image(10, 10, unit.equips.mainHand)
  scene.mainHandContainer.add(scene.mainHand)
  scene.mainHand.setScale(0.2)
  scene.mainHand.setOrigin(1,1)
}

function renderBackCharacter(scene: Chara, unit: AnimatedUnit) {
  function renderHead(gx: number, gy: number) {
    const head = scene.add.image(
      gx,
      gy,
      'back_head' + unit.style.head.toString(),
    );
    scene.container?.add(head);
    return head
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
      'back_trunk' + unit.style.trunk.toString(),
    );

    scene.container?.add(trunk);

    return trunk
  }

  function renderHand(handX: number, handY: number) {
    const hand = scene.add.image(handX, handY, 'hand');

    scene.container?.add(hand);
    return hand;
  }

  scene.rightHand = renderHand(35, 55);
  scene.rightHand.setRotation(-1.9)
  scene.rightHand.scaleX = scene.rightHand.scaleX * -1;

  scene.mainHandContainer = scene.add.container(RIGHT_HAND_BACK_X, RIGHT_HAND_BACK_Y)
  scene.container?.add(scene.mainHandContainer)
  scene.mainHandContainer.add(scene.rightHand)

  scene.mainHand = scene.add.image(10, 10, unit.equips.mainHand)
  scene.mainHandContainer.add(scene.mainHand)
  scene.mainHand.setScale(0.2)
  scene.mainHand.setOrigin(1,1)


  scene.rightFoot = renderFoot(10, 90);
  scene.leftFoot = renderFoot(-10, 97);


  scene.trunk = renderTrunk(0, 55);
  scene.head = renderHead(0, 0);
  scene.leftHand = renderHand(-30, 60);




  

}
