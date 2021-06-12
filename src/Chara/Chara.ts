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

type Chara = {
  props: CharaProps;

  /** Container around Chara, doesn't rotate (useful for adding UI elements)*/
  charaWrapper: Container;
  container: Container;

  //body parts

  hair: Image | null ;
  head: Image | null ;
  trunk: Image | null ;
  leftHand: Image | null ;
  rightHand: Image | null;
  leftFoot: Image | null ;
  rightFoot: Image | null;

  mainHandContainer: Container | null;
  offHandContainer: Container | null;

  //Equips
  rightHandEquip: Image | null;
  leftHandEquip: Image | null;
  hat: Image | null ;

  hpBarContainer: Container | null;

  // constructor({
  //   key,
  //   parent,
  //   unit,
  //   cx = 0,
  //   cy = 0,
  //   scaleSizing = 1,
  //   front = true,
  //   animated = true,
  //   headOnly = false,
  //   showHpBar = false,
  //   showWeapon = true,
  // }: CharaProps) {
  //   super(key);


}
