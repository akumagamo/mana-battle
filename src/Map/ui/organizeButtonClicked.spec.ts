import { organizeButtonClicked } from "./organizeButtonClicked";
import { Map, Set } from "immutable";
import { createCity, createForce, createMapSquad, MapState } from "../Model";
import { createSquad } from "../../Squad/Model";
import { run } from "../../Squad/ListSquadsScene/ListSquadsScene";
import { CPU_FORCE, PLAYER_FORCE } from "../../constants";
import { createUnit } from "../../Unit/Model";

jest.mock("../../Squad/ListSquadsScene/ListSquadsScene");

const defaultProps = {
  turnOff: jest.fn(),
  state: {
    id: "test",
    name: "test_map",
    author: "lfarroco",
    description: "test map",
    cells: [
      [1, 1, 1],
      [1, 1, 1],
      [1, 1, 1],
    ],
    forces: [
      createForce(PLAYER_FORCE, "Player", ["player_squad_1"], "city_1"),
      createForce(CPU_FORCE, "CPU", ["cpu_squad_1"], "city_2"),
    ],
    cities: [
      { ...createCity("city_1", 1, 1), force: PLAYER_FORCE },
      { ...createCity("city_2", 3, 3), force: CPU_FORCE },
    ],
    squads: Map({
      player_squad_1: {
        ...createMapSquad(
          createSquad({
            id: "player_squad_1",
            members: Map(),
            force: PLAYER_FORCE,
            leader: "player_unit_1",
          })
        ),
        pos: { x: 1, y: 1 },
      },

      cpu_squad_1: {
        ...createMapSquad(
          createSquad({
            id: "cpu_squad_1",
            members: Map(),
            force: PLAYER_FORCE,
            leader: "cpu_unit_1",
          })
        ),
        pos: { x: 3, y: 3 },
      },
    }),
    units: Map({
      player_unit_1: createUnit("player_unit_1"),
      cpu_squad_1: createUnit("cpu_squad_1"),
    }),
    ai: Map(),
    dispatchedSquads: Set(["player_unit_1", "cpu_squad_1"]),
  } as MapState,
  scene: { manager: { stop: jest.fn(), start: jest.fn() } as any },
};

beforeEach(() => {
  //@ts-ignore
  run.mockClear();
});

it("should start ListSquadScene when clicked", () => {
  organizeButtonClicked(defaultProps, () => {});
});

it.todo("should stop MapScene when clicked");

it.todo("should only pass units owned by the player to ListSquadScene");
it.todo("should only pass squads owned by the player to ListSquadScene");
it.todo("should call a fadeOut");
it.todo("should pass the dispatched squads id to ListSquadScene");
it.todo("should pass the dispatched squads id to ListSquadScene");
it.todo(
  "when the player returns, should merge the received data back into MapScene before starting it"
);
it.todo("when the player returns, should stop ListSquadScene");
it.todo("when the player returns, should clear ListSquadScene");
