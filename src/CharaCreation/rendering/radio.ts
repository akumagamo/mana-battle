import {addChildToContainer} from "../../Browser/phaser";
import button from "../../UI/button";
import { CharaCreationState } from "../Model";
import {BTN_MARGIN} from "./config";
import formPanel from "./formPanel";
import refreshChara from "./refreshChara";

function radio(
  scene: Phaser.Scene,
  state: CharaCreationState,
  x: number,
  y: number,
  label: string,
  prop: "class" | "gender",
  items: string[],
  labelIndex: { [id: string]: string },
  width?: number
) {
  const classBtnSize = 120;

  const renderBtn = (value: string, i: number) => {
    return button(
      20 + x + BTN_MARGIN + i * classBtnSize,
      y + 60,
      labelIndex[value],
      state.container,
      scene,
      () => {
        state.unit = {
          ...state.unit,
          [prop]: value,
        };
        elems.map((e) => e.destroy());
        radio(scene, state, x, y, label, prop, items, labelIndex, width);
        refreshChara(scene, state);
      },
      false,
      classBtnSize,
      0,
      value === state.unit[prop]
    );
  };
  const panel_ = formPanel(scene, state, x, y, label, width);
  const btns = items.map((g, i) => renderBtn(g, i));
  const elems: (Phaser.GameObjects.Graphics | { destroy: () => void })[] = [
    panel_,
    ...btns,
  ];
}

export default radio;
