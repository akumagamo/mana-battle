import chapter1 from "../../Campaign/chapter1";
import { Unit } from "../../Unit/Model";
import { CharaCreationState } from "../Model";

export default function (scene: Phaser.Scene, state: CharaCreationState) {
  const name: string = (<HTMLInputElement>(
    document.getElementById("new-chara-name")
  )).value;
  const unit: Unit = { ...state.unit, name };

  state.chara.destroy();
  scene.scene.stop();

  // TEST CODE

  chapter1(scene, unit);
}
