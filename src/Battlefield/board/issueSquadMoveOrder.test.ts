import map from "../../maps/green_harbor";
import { sceneMock } from "../../test/mocks";
import { issueSquadMoveOrder } from "./issueSquadMoveOrder";
import { changeMode } from "../Mode";
import { CPU_FORCE, PLAYER_FORCE } from "../../constants";
import createChara from "../../Chara/createChara";
import { createUnit } from "../../Unit/Model";
import moveSquadTo from "../squads/moveSquadTo";
import animateSquadRun from "../squads/animateSquadRun";

jest.mock("../Mode");
jest.mock("../squads/moveSquadTo");
jest.mock("../squads/animateSquadRun");

const scene = sceneMock();

let state = map();

beforeEach(() => {
  (animateSquadRun as jest.Mock).mockClear();
  (moveSquadTo as jest.Mock).mockClear();
  (changeMode as jest.Mock).mockClear();
});

state.charas.push(createChara({ scene, unit: createUnit("enemy1") }));

it("should issue move order if the player squad is issued move order to a moveable cell", () => {
  state.squads = state.squads.setIn(["squad1", "squad", "force"], PLAYER_FORCE);
  issueSquadMoveOrder(scene, state, { x: 3, y: 3 }, "squad1");

  expect(moveSquadTo).toBeCalled();
  expect(changeMode).toBeCalledWith(
    expect.anything(),
    expect.anything(),
    expect.objectContaining({ type: "NOTHING_SELECTED" })
  );
});

it("should not issue move order if squad is not a player squad", () => {
  state.squads = state.squads.setIn(["squad1", "squad", "force"], CPU_FORCE);
  issueSquadMoveOrder(scene, state, { x: 3, y: 3 }, "squad1");

  expect(moveSquadTo).not.toBeCalled();
  expect(changeMode).not.toBeCalled();
});

it("should not issue move order if targeted a non-moveable cell (water)", () => {
  state.squads = state.squads.setIn(["squad1", "squad", "force"], PLAYER_FORCE);
  issueSquadMoveOrder(scene, state, { x: 0, y: 0 }, "squad1");

  expect(moveSquadTo).not.toBeCalled();
  expect(changeMode).toBeCalledWith(
    expect.anything(),
    expect.anything(),
    expect.objectContaining({ type: "SQUAD_SELECTED", id: "squad1" })
  );
});
