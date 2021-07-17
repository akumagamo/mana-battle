import { List, Map, Set } from "immutable";
import {
  AI_COMMANDS,
  CellNumber,
  City,
  CITY_TYPE_CASTLE,
  CITY_TYPE_TOWN,
  emptyMapSquadIndex,
  initialBattlefieldState,
  MapState,
  relationsTypes,
} from "../Battlefield/Model";
import createUnit from "../Unit/createUnit";
import { toMapSquad } from "../Unit/Model";
import { CPU_FORCE, PLAYER_FORCE } from "../constants";
import { createSquad, emptyUnitSquadIndex, makeMember } from "../Squad/Model";

const enemyCastle: City = {
  id: "castle2",
  name: "Madamaxe",
  x: 10,
  y: 4,
  force: CPU_FORCE,
  type: CITY_TYPE_CASTLE,
};

const tiles: CellNumber[][] = [
  [3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 2, 2, 3],
  [3, 3, 3, 3, 3, 3, 0, 0, 0, 0, 0, 0, 1, 3, 3, 3, 3, 0, 0, 0, 0, 0, 0, 0],
  [3, 3, 3, 0, 1, 1, 0, 0, 0, 2, 0, 0, 0, 3, 0, 1, 1, 0, 0, 0, 2, 0, 0, 0],
  [3, 3, 3, 0, 2, 2, 0, 0, 0, 2, 0, 0, 0, 3, 0, 2, 2, 0, 0, 0, 2, 0, 0, 0],
  [3, 0, 0, 0, 2, 1, 0, 0, 0, 2, 0, 0, 1, 0, 0, 2, 1, 0, 0, 0, 2, 0, 0, 0],
  [3, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0],
  [3, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 0, 1, 0, 0, 0, 0, 0, 0, 2, 2, 2, 0, 0],
  [3, 3, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
  [3, 3, 3, 3, 3, 0, 0, 2, 2, 2, 0, 0, 2, 3, 3, 3, 0, 0, 2, 2, 2, 0, 0, 2],
  [3, 3, 3, 3, 3, 3, 3, 2, 1, 2, 0, 0, 1, 3, 3, 3, 3, 3, 2, 1, 2, 0, 0, 2],
  [3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 2, 2, 3],
  [3, 3, 3, 3, 3, 3, 0, 0, 0, 0, 0, 0, 1, 3, 3, 3, 3, 0, 0, 0, 0, 0, 0, 0],
  [3, 3, 3, 0, 1, 1, 0, 0, 0, 2, 0, 0, 0, 3, 0, 1, 1, 0, 0, 0, 2, 0, 0, 0],
  [3, 3, 3, 0, 2, 2, 0, 0, 0, 2, 0, 0, 0, 3, 0, 2, 2, 0, 0, 0, 2, 0, 0, 0],
  [3, 0, 0, 0, 2, 1, 0, 0, 0, 2, 0, 0, 1, 0, 0, 2, 1, 0, 0, 0, 2, 0, 0, 0],
  [3, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0],
  [3, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 0, 1, 0, 0, 0, 0, 0, 0, 2, 2, 2, 0, 0],
  [3, 3, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
  [3, 3, 3, 3, 3, 0, 0, 2, 2, 2, 0, 0, 2, 3, 3, 3, 0, 0, 2, 2, 2, 0, 0, 2],
  [3, 3, 3, 3, 3, 3, 3, 2, 1, 2, 0, 0, 1, 3, 3, 3, 3, 3, 2, 1, 2, 0, 0, 2],
];
const map: () => MapState = () => {
  const state = {
    ...initialBattlefieldState,
    id: "greenHarbor",
    name: "Green Harbor",
    author: "Leonardo Farroco",
    description: "The first map",
    cells: tiles,
    dispatchedSquads: Set(["squad1", "squad2"]),
    squads: List([
      toMapSquad(
        createSquad({
          id: "squad1",
          leader: "enemy1",
          members: Map({
            enemy1: makeMember({ id: "enemy1", x: 1, y: 2 }),
            enemy2: makeMember({ id: "enemy2", x: 3, y: 1 }),
            enemy3: makeMember({ id: "enemy3", x: 3, y: 2 }),
            enemy4: makeMember({ id: "enemy4", x: 3, y: 3 }),
          }),
          force: CPU_FORCE,
        }),
        { x: 6, y: 4 }
      ),
      toMapSquad(
        createSquad({
          id: "squad2",
          leader: "enemy5",
          members: Map({
            enemy5: makeMember({ id: "enemy5", x: 2, y: 2 }),
            enemy6: makeMember({ id: "enemy6", x: 3, y: 1 }),
            enemy7: makeMember({ id: "enemy7", x: 3, y: 2 }),
            enemy8: makeMember({ id: "enemy8", x: 3, y: 3 }),
          }),
          force: CPU_FORCE,
        }),
        enemyCastle
      ),
    ]).reduce((xs, x) => xs.set(x.id, x), emptyMapSquadIndex),
    forces: [
      {
        id: PLAYER_FORCE,
        name: "Lankel Knights",
        squads: [],
        relations: Map({ [CPU_FORCE]: relationsTypes.hostile }),
        initialPosition: "castle1",
      },
      {
        id: CPU_FORCE,
        name: "Enemy",
        squads: ["squad1", "squad2"],
        relations: Map({ [PLAYER_FORCE]: relationsTypes.hostile }),
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
        type: CITY_TYPE_CASTLE,
      },
      enemyCastle,
      {
        id: "c1",
        name: "Arabella",
        x: 2,
        y: 6,
        force: CPU_FORCE,
        type: CITY_TYPE_TOWN,
      },
      {
        id: "c2",
        name: "Marqueze",
        x: 10,
        y: 1,
        force: CPU_FORCE,
        type: CITY_TYPE_TOWN,
      },
      {
        id: "c3",
        name: "Bauhaus",
        x: 9,
        y: 5,
        force: CPU_FORCE,
        type: CITY_TYPE_TOWN,
      },
      {
        id: "c4",
        name: "Vila Rica",
        x: 6,
        y: 4,
        force: CPU_FORCE,
        type: CITY_TYPE_TOWN,
      },
    ],
    // this can be moved to a derivative property
    units: Map({
      enemy1: createEnemyUnit("enemy1"),
      enemy2: createEnemyUnit("enemy2"),
      enemy3: createEnemyUnit("enemy3"),
      enemy4: createEnemyUnit("enemy4"),
      enemy5: createEnemyUnit("enemy5"),
      enemy6: createEnemyUnit("enemy6"),
      enemy7: createEnemyUnit("enemy7"),
      enemy8: createEnemyUnit("enemy8"),
    }),
    ai: Map({
      squad1: AI_COMMANDS.ATTACK,
      squad2: AI_COMMANDS.DEFEND,
    }),
  };

  return {
    ...state,
    unitSquadIndex: state.squads.reduce((xs, x) => {
      const units = x.squad.members.reduce(
        (us, u) => us.set(u.id, x.id),
        emptyUnitSquadIndex
      );
      return xs.merge(units);
    }, emptyUnitSquadIndex),
  };
};

const createEnemyUnit = (id: string) => ({
  ...createUnit(id),
  force: CPU_FORCE,
});

export default map;
