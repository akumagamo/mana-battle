import { MapScene } from "./MapScene";
import { Vector } from "./Model";
import { refreshUI } from "./ui";

export type Mode =
  | { type: "NOTHING_SELECTED" }
  | { type: "SQUAD_SELECTED"; id: string }
  | { type: "CITY_SELECTED"; id: string }
  | { type: "MOVING_SQUAD"; start: Vector; id: string } // deprecated
  | { type: "SELECT_SQUAD_MOVE_TARGET"; start: Vector; id: string } // deprecated
  | { type: "CHANGING_SQUAD_FORMATION" };
export const DEFAULT_MODE: Mode = { type: "NOTHING_SELECTED" };

export function changeMode(scene: MapScene, mode: Mode) {
  scene.mode = mode;
  refreshUI(scene);
}
