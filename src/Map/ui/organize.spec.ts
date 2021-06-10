import { organize } from "./organize";
import { Map, Set } from "immutable";
import { createMapSquad } from "../Model";
import { makeSquad } from "../../Squad/Model";
import { run } from "../../Squad/ListSquadsScene";

//ListSquadsScene  is now a mock constructor
jest.mock("../../Squad/ListSquadsScene", () => ({
  run: jest.fn(),
}));

jest.mock("../../Board/StaticBoardScene", () => ({
  default: {},
}));

jest.mock("../../Board/InteractiveBoardScene", () => ({
  default: {},
}));
jest.mock("../../Chara/Chara", () => ({
  Chara: {},
}));
jest.mock("../MapScene", () => ({
  MapScene: {},
}));

beforeEach(() => {
  //@ts-ignore
  run.mockClear();
});

it("should start ListSquadScene when clicked", () => {
  const manager = {
    stop: () => console.log(`aaaa`),
  };

  organize(
    {
      id: "a",
      name: "a",
      author: "a",
      description: "a",
      cells: [
        [1, 2, 3],
        [1, 2, 3],
      ],
      forces: [],
      cities: [],
      squads: Map({
        a: createMapSquad(
          makeSquad({ id: "s1", members: Map(), force: "f1", leader: "u1" })
        ),
      }),
      units: Map(),
      ai: Map(),
      dispatchedSquads: Set(),
    },
    manager as Phaser.Scenes.SceneManager
  );
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
