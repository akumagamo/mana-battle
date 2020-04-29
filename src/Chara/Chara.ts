import * as Phaser from 'phaser';

import {Unit, AnimatedUnit} from '../Unit/Model';
import {Container, Pointer, Image} from '../Models';
import {INVALID_STATE} from '../errors';
import {getItem} from '../DB';
import run from './animations/run';

import {RIGHT_HAND_FRONT_X, RIGHT_HAND_FRONT_Y, CHARA_WRAPPER_X} from './animations/constants';
import defaultPose from './animations/defaultPose';
import stand from './animations/stand';
import flinch from './animations/flinch';
import attack from './animations/attack';
import initial from './animations/initial';

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

    //the unit has two wrappers to allow multiple tweens at once
    this.charaWrapper = this.add.container(0, 0);

    this.container = this.add.container(this.cx, this.cy);

    this.charaWrapper.add(this.container);

    this.container.setDepth(this.cy);

    initial(this)
    this.stand()

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

    this.container.name = this.unit.id;

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
    defaultPose(this);
  }

  stand() {
    stand(this);
  }

  attack( onComplete: () => void) {
    attack(this, onComplete);
  }

  flinch( damage:number, isKilled:boolean) {
    flinch(this, damage, isKilled);
  }

  die(){

    console.log(`die!!`)

    this.tweens.add({
      targets:this.container,
      alpha: 0,
      duration: 1000
    })

  }

  run() {
    run(this);
  }
}
