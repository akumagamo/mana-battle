import createChara from "../../Chara/createChara";
import { CharaCreationState } from "../Model";

export default function (scene: Phaser.Scene, state: CharaCreationState) {
  if (state.chara) state.chara.destroy();

  state.chara = createChara({
    scene: scene,
    unit: state.unit,
    x: 250,
    y: 250,
    scale: 3,
    showWeapon: false,
  });
}
