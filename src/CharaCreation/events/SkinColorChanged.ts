import {CharaCreationState} from "../Model";
import refreshChara from "../rendering/refreshChara";

export default function (
  scene: Phaser.Scene,
  state: CharaCreationState,
  color: number
) {
  state.unit = {
    ...state.unit,
    style: { ...state.unit.style, skinColor: color },
  };
  refreshChara(scene, state);

  //dispatch
  //onChangeSkingColor(x, y)(color, index);
}
