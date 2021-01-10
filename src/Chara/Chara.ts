import * as Phaser from "phaser";

import { Unit } from "../Unit/Model";
import { Container, Pointer, Image } from "../Models";
import run from "./animations/run";

import defaultPose from "./animations/defaultPose";
import stand from "./animations/stand";
import flinch from "./animations/flinch";
import slash from "./animations/slash";
import bowAttack from "./animations/bowAttack";
import initial from "./animations/initial";
import hpBar from "./hpBar";

const CHARA_INACTIVE_COLOR = 222222;
export class Chara extends Phaser.Scene {
  /** Container around Chara, doesn't rotate (useful for adding UI elements)*/
  charaWrapper: Container = {} as Container;
  container: Container = {} as Container;

  //body parts

  hair: Image | null = null;
  head: Image | null = null;
  trunk: Image | null = null;
  leftHand: Image | null = null;
  rightHand: Image | null = null;
  leftFoot: Image | null = null;
  rightFoot: Image | null = null;

  mainHandContainer: Container | null = null;
  offHandContainer: Container | null = null;

  //Equips
  rightHandEquip: Image | null = null;
  leftHandEquip: Image | null = null;
  hat: Image | null = null;

  hpBarContainer: Container | null;

  constructor(
    public key: string,
    public parent: Phaser.Scene,
    public unit: Unit,
    public cx: number,
    public cy: number,
    public scaleSizing: number, // todo: rename
    public front: boolean = true,
    public animated = true,
    public headOnly = false,
    public showHpBar = false,
    public showWeapon = true
  ) {
    super(key);

    parent.scene.add(key, this, true);

    return this;
  }
  create() {
    //the unit has two wrappers to allow multiple tweens at once
    this.charaWrapper = this.add.container();

    this.container = this.add.container(this.cx, this.cy);

    this.charaWrapper.add(this.container);

    this.container.setDepth(this.cy);

    initial(this, this.headOnly);

    if (this.animated) this.stand();

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
    //

    if (this.showHpBar) {
      this.renderHPBar(this.unit.currentHp);
    }

    this.container.scale = this.scaleSizing;

    this.container.name = this.unit.id;
  }

  public renderHPBar(hpAmount: number) {
    if (this.hpBarContainer) this.hpBarContainer.destroy();

    if (hpAmount < 1) {
      this.tint(CHARA_INACTIVE_COLOR);
      return;
    }

    this.hpBarContainer = hpBar(this, this.container, hpAmount, this.unit.hp);
  }

  private maybeRenderInsignea() {
    if (this.unit.leader) {
      const insignea = this.add.image(50, 0, "insignea");
      this.container.add(insignea);
    }
  }

  onClick(fn: (chara: Chara) => void) {
    this.container.setInteractive();

    this.container.on("pointerdown", (_pointer: Pointer) => {
      fn(this);
    });
  }

  enableDrag(
    dragStart: (unit: Unit, x: number, y: number, chara: Chara) => void,
    dragEnd: (unit: Unit, x: number, y: number, chara: Chara) => void
  ) {
    this.container.setInteractive();
    this.input.setDraggable(this.container);

    this.input.on(
      "drag",
      (_pointer: Pointer, obj: Container, x: number, y: number) => {
        this.container.setDepth(Infinity);

        obj.x = x;
        obj.y = y;

        dragStart(this.unit, x, y, this);
      }
    );

    this.container.on(
      "dragend",
      (_pointer: Pointer, _dragX: number, dragY: number) => {
        this.container.setDepth(dragY);
        dragEnd(this.unit, this.container.x || 0, this.container.y || 0, this);
      }
    );
  }

  handleClick(fn: (chara: Chara, pointer: Pointer) => void) {
    this.container.on("pointerdown", (pointer: Pointer) => {
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

  performBowAttack(onComplete: () => void) {
    bowAttack(this, onComplete);
  }

  slash(onComplete: () => void) {
    slash(this, onComplete);
  }

  flinch(damage: number, isKilled: boolean) {
    if (this.showHpBar) this.renderHPBar(damage);
    flinch(this, damage, isKilled);
  }

  die() {
    this.tweens.add({
      targets: this.container,
      alpha: 0,
      duration: 1000,
    });
  }

  run() {
    run(this);
  }

  async fadeOut() {
    return new Promise<void>((resolve) => {
      const duration = 500;

      this.time.addEvent({
        delay: duration * 2,
        callback: resolve,
      });
      this.tweens.addCounter({
        from: 255,
        to: 0,
        duration,
        onComplete: () => {
          this.tweens.add({
            targets: this.container,
            alpha: 0,
            duration,
          });
        },
        onUpdate: (tween) => {
          var value = Math.floor(tween.getValue());

          this.tint(value);
        },
      });
    });
  }

  tint(value: number) {
    this.container.iterate(
      (child: Phaser.GameObjects.Image | Phaser.GameObjects.Container) => {
        if (child.type === "Container") {
          (child as Phaser.GameObjects.Container).iterate(
            (grand: Phaser.GameObjects.Image) => {
              grand.setTint(Phaser.Display.Color.GetColor(value, value, value));
            }
          );
        } else {
          (child as Phaser.GameObjects.Image).setTint(
            Phaser.Display.Color.GetColor(value, value, value)
          );
        }
      }
    );
  }
}
