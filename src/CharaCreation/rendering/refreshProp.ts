import {CharaCreationState} from "../Model";
import propSelector from "./propSelector";
import refreshChara from "./refreshChara";

export default function refreshProp(
  scene: Phaser.Scene,
  state: CharaCreationState,
    label: string,
    index: number,
    currentProp: "hair" | "skinColor" | "hairColor",
    items: string[] | number[],
    x: number,
    y: number
  ) {
    state.unit = {
      ...state.unit,
      style: {
        ...state.unit.style,
        [currentProp]: items[index],
      },
    };
    refreshChara(scene, state);
    propSelector(scene, state, x, y, index, label, currentProp, items);
  }

