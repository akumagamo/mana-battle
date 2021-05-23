import { Vector, MapSquad, MapState } from './Model';
import { Unit } from '../Unit/Model';
import { MapTile } from './MapScene';
export type MapCommands =
  | { type: 'UPDATE_STATE'; target: MapState }
  | { type: 'UPDATE_SQUAD_POS'; id: string; pos: Vector }
  | { type: 'UPDATE_UNIT'; unit: Unit }
  | {
      type: 'DESTROY_TEAM';
      target: string;
    }
  | {
      type: 'CLICK_CELL';
      cell: MapTile;
    }
  | {
      type: 'CLICK_SQUAD';
      unit: MapSquad;
    }
  | { type: 'CLEAR_TILES' }
  | { type: 'MOVE_CAMERA_TO'; x: number; y: number; duration: number }
  | { type: 'CLEAR_TILES_EVENTS' }
  | { type: 'CLEAR_TILES_TINTING' }
  | { type: 'RESET_SQUAD_POSITION'; unit: MapSquad }
  | { type: 'HIGHLIGHT_CELL'; pos: Vector }
  | { type: 'SELECT_CITY'; id: string }
  | { type: 'SET_SELECTED_UNIT'; id: string }
  | { type: 'VIEW_SQUAD_DETAILS'; id: string }
  | { type: 'REFRESH_UI' }
  | { type: 'CITY_CLICK'; id: string }
  | { type: 'CAPTURE_CITY'; id: string; force: string }
  | { type: 'PUSH_SQUAD'; winner: string; loser: string; direction: string }
  | { type: 'MOVE_SQUAD'; mapTile: MapTile; squad: MapSquad };
