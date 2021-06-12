import { Unit } from "../Unit/Model";
import { Container, Pointer, Image } from "../Models";
import { PUBLIC_URL } from "../constants";
import {classes} from "../Unit/Jobs";
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
  evs: {};
  props: CharaProps;

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

  preload() {
    loadCharaAssets(this);
  }

  create() {
    createChara(this)
  }

  onClick(fn: (chara: Chara) => void) {
    this.container.setInteractive();

    this.container.on("pointerdown", (_pointer: Pointer) => {
      fn(this);
    });
  }

}
export const loadCharaAssets = (scene: Phaser.Scene) => {
  [
    "insignea",
    "hand",
    "foot",
    "head",
    "chara/head_male",
    "chara/head_female",
  ].forEach((str) => scene.load.image(str, PUBLIC_URL + "/" + str + ".svg"));
  const hairs = [
    "dark1",
    "long1",
    "long2",
    "split",
    "split2",
    "male1",
    "female1",
    "female2",
  ];
  hairs.forEach((str) => {
    scene.load.image(str, PUBLIC_URL + "/hair/" + str + ".svg");
    scene.load.image("back_" + str, PUBLIC_URL + "/hair/back_" + str + ".svg");
  });

  scene.load.image("head", PUBLIC_URL + "/head.svg");
  scene.load.image("back_head", PUBLIC_URL + "/back_head.svg");

  classes.forEach((job) => {
    scene.load.image(`trunk_${job}`, `${PUBLIC_URL}/trunk_${job}.svg`);
    scene.load.image(
      `trunk_back_${job}`,
      `${PUBLIC_URL}/trunk_back_${job}.svg`
    );
  });
  const equips = [
    "equips/iron_sword",
    "equips/iron_spear",
    "equips/steel_sword",
    "equips/baldar_sword",
    "equips/oaken_staff",
    "equips/bow",

    "equips/simple_helm",
    "equips/iron_helm",
    "equips/wiz_hat",
    "equips/archer_hat",

    "equips/back_simple_helm",
    "equips/back_iron_helm",
    "equips/back_wiz_hat",
    "equips/back_archer_hat",
  ];
  equips.forEach((id: string) => {
    scene.load.image(id, `${PUBLIC_URL}/${id}.svg`);
  });
};
