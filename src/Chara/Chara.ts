import { Unit } from "../Unit/Model";
import { Container, Pointer, Image } from "../Models";
import createChara from "./createChara";

interface CharaProps {
  key: string;
  parent: Phaser.Scene;
  // TODO: remove unit, we should have just the eid (avoid data dup)
  unit: Unit;
  cx?: number;
  cy?: number;
  scaleSizing?: number; // todo: rename - we can't use `scale` because it overrides the Phaser.Scene one
  front?: boolean;
  animated?: boolean;
  headOnly?: boolean;
  showHpBar?: boolean;
  showWeapon?: boolean;
}

export class Chara extends Phaser.Scene {
  props: CharaProps;

  /** Container around Chara, doesn't rotate (useful for adding UI elements)*/
  charaWrapper: Container;
  container: Container;

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

  constructor({
    key,
    parent,
    unit,
    cx = 0,
    cy = 0,
    scaleSizing = 1,
    front = true,
    animated = true,
    headOnly = false,
    showHpBar = false,
    showWeapon = true,
  }: CharaProps) {
    super(key);

    this.props = {
      key,
      parent,
      unit,
      cx,
      cy,
      scaleSizing,
      front,
      animated,
      headOnly,
      showHpBar,
      showWeapon,
    };

    parent.scene.add(key, this, true);

    return this;
  }

  create() {
    createChara(this);
  }

}
