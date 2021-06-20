import {addChildToContainer} from "../../Browser/phaser";
import { CharaCreationState } from "../Model";
import formPanel from "./formPanel";

export default function (
  scene: Phaser.Scene,
  state: CharaCreationState,
  x: number,
  y: number
) {
  formPanel(scene, state, x, y, "Character Name", 300);

  var element = scene.add.dom(x + 10, y + 50).createFromCache("nameform");
  element.setPerspective(800);
  element.setOrigin(0);
}
