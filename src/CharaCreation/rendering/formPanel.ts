import panel from "../../UI/panel";
import text from "../../UI/text";
import { CharaCreationState } from "../Model";

export const panelWidth = 600;
export const panelHeight = 120;

export default function (
  scene: Phaser.Scene,
  state: CharaCreationState,
  x: number,
  y: number,
  label: string,
  width?: number
) {
  const panel_ = panel(
    x,
    y,
    width ? width : panelWidth,
    panelHeight,
    state.container,
    scene
  ).setAlpha(0.6);
  text(x + 10, y + 10, label, state.container, scene);

  return panel_;
}
