import { Vector, MapSquad, MapState, MapTile } from "./Model";
import { Unit } from "../Unit/Model";
export type MapCommands =
  | { type: "UPDATE_STATE"; target: MapState }
  | { type: "UPDATE_SQUAD_POS"; id: string; pos: Vector }
  | { type: "UPDATE_UNIT"; unit: Unit }
  | {
      type: "DESTROY_TEAM";
      target: string;
    }
  | {
      type: "CLICK_CELL";
      cell: Vector;
    }
  | { type: "MOVE_CAMERA_TO"; x: number; y: number; duration: number }
  | { type: "CLEAR_TILES_EVENTS" }
  | { type: "CLEAR_TILES_TINTING" }
  | { type: "RESET_SQUAD_POSITION"; unit: MapSquad }
  | { type: "SELECT_CITY"; id: string }
  | { type: "SET_SELECTED_UNIT"; id: string }
  | { type: "VIEW_SQUAD_DETAILS"; id: string }
  | { type: "REFRESH_UI" }
  | { type: "CITY_CLICK"; id: string }
  | { type: "CAPTURE_CITY"; id: string; force: string }
  | { type: "PUSH_SQUAD"; winner: string; loser: string; direction: string }
  | { type: "MOVE_SQUAD"; mapTile: MapTile; squad: MapSquad };
