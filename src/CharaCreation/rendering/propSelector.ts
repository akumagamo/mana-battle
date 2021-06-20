import button from "../../UI/button";
import text from "../../UI/text";
import { CharaCreationState } from "../Model";
import formPanel from "./formPanel";
import refreshProp from "./refreshProp";

export const baseX = 500;
export const baseY = 50;

export default function propSelector(
  scene: Phaser.Scene,
  state: CharaCreationState,
  x: number,
  y: number,
  index: number,
  label: string,
  prop: "hair" | "skinColor" | "hairColor",
  items: any[]
) {
  const panel_ = formPanel(scene, state, x, y, label);
  const style = text(
    baseX + 203,
    y + 65,
    (index + 1).toString(),
    state.container,
    scene
  );

  const prev = button(
    20 + baseX,
    y + 60,
    "<=",
    state.container,
    scene,
    () => {
      refresh();
      refreshProp(scene, state, label, index - 1, prop, items, x, y);
    },
    index < 1
  );
  const next = button(
    230 + baseX,
    y + 60,
    "=>",
    state.container,
    scene,
    () => {
      refresh();
      refreshProp(scene, state, label, index + 1, prop, items, x, y);
    },
    index >= items.length - 1
  );

  function refresh() {
    style.destroy();
    panel_.destroy();
    prev.destroy();
    next.destroy();
  }
}
