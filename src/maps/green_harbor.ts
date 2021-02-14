import { List, Map, Set } from "immutable";
import { CellNumber, City, MapState } from "../Map/Model";
import { getSquadsFromDB } from "../DB";
import { makeUnit } from "../Unit/makeUnit";
import { toMapSquad } from "../Unit/Model";
import { CPU_FORCE, PLAYER_FORCE } from "../constants";
import { makeSquad, makeSquadMember } from "../Squad/Model";

const enemyCastle: City = {
  id: "castle2",
  name: "Madamaxe",
  x: 10,
  y: 4,
  force: CPU_FORCE,
  type: "castle",
};

const tiles: CellNumber[][] = [
  [3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 2, 2, 2, 2],
  [3, 3, 3, 3, 3, 3, 0, 0, 0, 0, 0, 0, 1, 0],
  [3, 3, 3, 0, 1, 1, 0, 0, 0, 2, 0, 0, 0, 0],
  [3, 3, 3, 0, 2, 2, 0, 0, 0, 2, 0, 0, 0, 0],
  [3, 0, 0, 0, 2, 1, 0, 0, 0, 2, 0, 0, 1, 0],
  [3, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0],
  [3, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 0, 1, 2],
  [3, 3, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1],
  [3, 3, 3, 3, 3, 0, 0, 2, 2, 2, 0, 0, 2, 2],
  [3, 3, 3, 3, 3, 3, 3, 2, 1, 2, 0, 0, 1, 2],
];
const map: () => MapState = () => {
  const playerSquad = Object.keys(getSquadsFromDB())[0];

  return {
    id: "greenHarbor",
    name: "Green Harbor",
    author: "Leonardo Farroco",
    description: "The first map",
    dispatchedSquads: Set(),
    cells: tiles,
    squads: List([
      toMapSquad(
        makeSquad({
          id: "squad1",
          leader: "enemy1",
          members: Map({
            enemy1: makeSquadMember({ id: "enemy1", x: 1, y: 2 }),
            enemy2: makeSquadMember({ id: "enemy2", x: 3, y: 1 }),
            enemy3: makeSquadMember({ id: "enemy3", x: 3, y: 2 }),
            enemy4: makeSquadMember({ id: "enemy4", x: 3, y: 3 }),
          }),
          force: CPU_FORCE,
        }),
        { x: 6, y: 4 }
      ),
      toMapSquad(
        makeSquad({
          id: "squad2",
          members: Map({
            enemy5: makeSquadMember({ id: "enemy5", x: 2, y: 2 }),
            enemy6: makeSquadMember({ id: "enemy6", x: 3, y: 1 }),
            enemy7: makeSquadMember({ id: "enemy7", x: 3, y: 2 }),
            enemy8: makeSquadMember({ id: "enemy8", x: 3, y: 3 }),
          }),
          force: CPU_FORCE,
        }),
        enemyCastle
      ),
    ]),
    forces: [
      {
        id: PLAYER_FORCE,
        name: "Lankel Knights",
        squads: [playerSquad],
        relations: { [CPU_FORCE]: "hostile" },
        initialPosition: "castle1",
      },
      {
        id: CPU_FORCE,
        name: "Enemy",
        squads: ["squad1", "squad2"],
        relations: { [PLAYER_FORCE]: "hostile" },
        initialPosition: "castle2",
      },
    ],
    cities: [
      {
        id: "castle1",
        name: "Izabel",
        x: 3,
        y: 5,
        force: PLAYER_FORCE,
        type: "castle",
      },
      enemyCastle,
      {
        id: "c1",
        name: "Arabella",
        x: 2,
        y: 6,
        force: CPU_FORCE,
        type: "town",
      },
      {
        id: "c2",
        name: "Marqueze",
        x: 10,
        y: 1,
        force: CPU_FORCE,
        type: "town",
      },
      { id: "c3", name: "Bauhaus", x: 9, y: 5, force: CPU_FORCE, type: "town" },
      {
        id: "c4",
        name: "Vila Rica",
        x: 6,
        y: 4,
        force: CPU_FORCE,
        type: "town",
      },
    ],
    units: Map({
      enemy1: { ...makeUnit("fighter", 0, 10), id: "enemy1", squad: "squad1" },
      enemy2: { ...makeUnit("fighter", 0, 10), id: "enemy2", squad: "squad1" },
      enemy3: { ...makeUnit("fighter", 0, 10), id: "enemy3", squad: "squad1" },
      enemy4: { ...makeUnit("fighter", 0, 10), id: "enemy4", squad: "squad1" },
      enemy5: { ...makeUnit("fighter", 0, 10), id: "enemy5", squad: "squad2" },
      enemy6: { ...makeUnit("fighter", 0, 10), id: "enemy6", squad: "squad2" },
      enemy7: { ...makeUnit("fighter", 0, 10), id: "enemy7", squad: "squad2" },
      enemy8: { ...makeUnit("fighter", 0, 10), id: "enemy8", squad: "squad2" },
    }),
    ai: Map({
      squad1: "DEFEND",
      squad2: "DEFEND",
      squad3: "DEFEND",
    }),
  };
};

export default map;
