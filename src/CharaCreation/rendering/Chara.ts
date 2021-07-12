import createChara from "../../Chara/createChara";
import {Unit} from "../../Unit/Model";

export default (scene: Phaser.Scene, unit: Unit) =>
  createChara({
    scene: scene,
    unit,
    x: 250,
    y: 250,
    scale: 3,
    showWeapon: false,
  });
