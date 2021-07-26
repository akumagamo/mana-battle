import createChara from "../../Chara/createChara";
import map from "../../maps/green_harbor";
import { sceneMock } from "../../test/mocks";
import { createUnit } from "../../Unit/Model";
import pushSquad from "./pushSquad";

const scene = () => sceneMock();

const state = map();

const chara = createChara({ scene: scene(), unit: createUnit("enemy1") });

chara.container.x = state.squads.get("squad1")?.posScreen.x || 0;
chara.container.y = state.squads.get("squad1")?.posScreen.y || 0;

state.charas = [chara];

it("should move the pushed squad in the expected direction", async () => {
  state.squadToPush = { loser: "squad1", direction: "right" };

  const getPos = () => state.squads.get("squad1")?.posScreen || { x: 0, y: 0 };

  expect(getPos()).toEqual({ x: 650, y: 450 });

  await pushSquad(scene(), state);

  expect(getPos()).toEqual({ x: 750, y: 450 });
  expect((chara.container.setPosition as jest.Mock).mock.calls).toEqual([
    [750, 450],
  ]);
});
