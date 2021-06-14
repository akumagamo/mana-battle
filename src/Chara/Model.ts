import { Unit } from '../Unit/Model';
import { Container, Graphics, Image } from '../Models';

export type CharaProps = {
  parent: Phaser.Scene;
  unit: Unit;
  x: number;
  y: number;
  scale: number;
  front: boolean;
  animated: boolean;
  headOnly: boolean;
  showHpBar: boolean;
  showWeapon: boolean;
};

export type Chara = {
  id: string;
  props: CharaProps;
  scene: Phaser.Scene;
  /** Container around Chara, doesn't rotate (useful for adding UI elements)*/
  charaWrapper: Container;
  container: Container;

  //body parts

  hair: Image | null;
  head: Image | null;
  trunk: Image | null;
  leftHand: Image | null;
  rightHand: Image | null;
  leftFoot: Image | null;
  rightFoot: Image | null;

  mainHandContainer: Container | null;
  offHandContainer: Container | null;

  //Equips
  rightHandEquip: Image | null;
  leftHandEquip: Image | null;
  hat: Image | null;

  hpBarContainer: Container | null;
  destroy: () => void;
};
