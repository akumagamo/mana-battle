import { Map, Set } from "immutable";
import { SquadRecord } from "../Squad/Model";
import { UnitIndex } from "../Unit/Model";
export type UnitId = string;
export type ForceId = string;
export type CityId = string;

export type CellNumber =
  | 0
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11
  | 12
  | 13
  | 14
  | 15;

export type AICommand = "DEFEND" | "ATTACK";
export type MapState = {
  id: string;
  name: string;
  author: string;
  description: string;
  cells: CellNumber[][];
  forces: Force[];
  cities: City[];
  squads: Map<string, MapSquad>;
  units: UnitIndex;
  ai: Map<string, AICommand>;
  /** Contains the ids from all dispatched squads (from all forces). Should this move to the force? */
  dispatchedSquads: Set<string>;
};
export type Force = {
  id: ForceId;
  name: string;
  squads: string[];
  relations: { [id: string]: "hostile" | "neutral" | "ally" };
  initialPosition: string;
};

export function createForce(
  id: ForceId,
  name: string,
  squads: string[],
  initialPosition: string
): Force {
  return { id, name, squads, initialPosition, relations: {} };
}

export type City = {
  id: CityId;
  name: string;
  x: number;
  y: number;
  force: ForceId | null;
  type: "town" | "castle" | "shop";
};
export function createCity(id: string, x: number, y: number): City {
  return {
    id,
    name: "",
    x,
    y,
    force: null,
    type: "town",
  };
}

export type Vector = { x: number; y: number };
export type ValidStep = { target: Vector; steps: Vector[] };
export type EnemyInRange = { enemy: string; steps: Vector[] };
export type MapSquad = {
  id: string;
  squad: SquadRecord;
  pos: Vector;
  status: "alive" | "defeated" | "retreated" | "hidden";
};

export function createMapSquad(squad: SquadRecord): MapSquad {
  return {
    id: squad.id,
    squad,
    pos: { x: 1, y: 1 },
    status: "alive",
  };
}

export type TurnManager = {
  forces: Force[];
  mapSquads: MapSquad[];
  currentForce: ForceId;
  grid: number[][];
  walkableCells: number[];
};

export type Step = { target: Vector; steps: Vector[] };

export const tileMap: { [x in CellNumber]: string } = {
  0: "grass",
  1: "woods",
  2: "mountain",
  3: "water",

  4: "beach-r",
  5: "beach-l",
  6: "beach-t",
  7: "beach-b",

  8: "beach-tr",
  9: "beach-tl",
  10: "beach-br",
  11: "beach-bl",

  12: "beach-b-and-r",
  13: "beach-t-and-r",
  14: "beach-b-and-l",
  15: "beach-t-and-l", //br
};

export const translateTiles = (tiles: CellNumber[][]) => {
  return tiles.map((row, y) =>
    row.map((cell, x) => {
      if (cell === 3) {
        const rightIsland =
          tiles[y] && ![3, undefined].includes(tiles[y][x + 1]);
        const leftIsland =
          tiles[y] && ![3, undefined].includes(tiles[y][x - 1]);
        const topIsland =
          tiles[y - 1] && ![3, undefined].includes(tiles[y - 1][x]);
        const bottomIsland =
          tiles[y + 1] && ![3, undefined].includes(tiles[y + 1][x]);

        const bottomLeftIsLand =
          tiles[y + 1] && ![3, undefined].includes(tiles[y + 1][x - 1]);
        const topLeftIsLand =
          tiles[y - 1] && ![3, undefined].includes(tiles[y - 1][x - 1]);
        const bottomRightIsLand =
          tiles[y + 1] && ![3, undefined].includes(tiles[y + 1][x + 1]);
        const topRightIsLand =
          tiles[y - 1] && ![3, undefined].includes(tiles[y - 1][x + 1]);

        const waterVerts =
          !topIsland && !leftIsland && !rightIsland && !bottomIsland;

        if (bottomIsland && !leftIsland && !topIsland && !rightIsland) {
          return 6;
        }

        if (topIsland && !leftIsland && !bottomIsland && !rightIsland) {
          return 7;
        }

        if (!topIsland && rightIsland && !bottomIsland && !leftIsland) {
          return 5;
        }

        if (!topIsland && !rightIsland && !bottomIsland && leftIsland) {
          return 4;
        }

        /// diagonals
        if (waterVerts && topRightIsLand) {
          return 11;
        }

        if (waterVerts && topLeftIsLand) {
          return 10;
        }

        if (waterVerts && bottomRightIsLand) {
          return 9;
        }

        if (waterVerts && bottomLeftIsLand) {
          return 8;
        }

        //turns

        //tl
        if (topIsland && !rightIsland && !bottomIsland && leftIsland) {
          return 12;
        }

        //bl
        if (!topIsland && !rightIsland && leftIsland && bottomIsland) {
          return 13;
        }

        //tr
        if (topIsland && rightIsland && !bottomIsland && !leftIsland) {
          return 14;
        }

        //br
        if (!topIsland && rightIsland && bottomIsland && !leftIsland) {
          return 15;
        }
      }

      return cell;
    })
  );
};

export type BattleFieldMap = {
  [x: string]: MapState;
};

export function getCity(state: MapState, id: string): City {
  return state.cities.find((c) => c.id === id);
}
export function getForceUnits(state: MapState, force: string) {
  return state.units.filter((u) => u.force === force);
}
export function getForceSquads(state: MapState, force: string) {
  return state.squads.filter((u) => u.squad.force === force);
}
export function getForce(state: MapState, id: string) {
  return state.forces.find((f) => f.id === id);
}
