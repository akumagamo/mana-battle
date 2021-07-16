import { Unit } from "../Unit/Model";
import { Container, Image } from "../Models";
import { Map } from "immutable";

export type CharaProps = {
  scene: Phaser.Scene;
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
  container: Container;

  /** Container around Chara contents (useful for adding UI elements and bouncing while running)*/
  innerWrapper: Container;

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

  selectedCharaIndicator: Image | null;
};

export type CharaIndex = Map<string, Chara>;
export const emptyIndex = Map() as CharaIndex;
