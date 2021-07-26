import createChara from "../../Chara/createChara";
import map from "../../maps/green_harbor";
import { sceneMock } from "../../test/mocks";
import { createUnit } from "../../Unit/Model";
import aiAttack from "./aiAttack";

const scene = sceneMock();
it("should get path to closest enemy-controlled city if ATTACK", () => {
  const state = map();

  state.charas = [createChara({ scene, unit: createUnit("enemy1") })];

  aiAttack(state);

  expect(state.squadsInMovement.get("squad1")?.path || []).toHaveLength(4);

  expect(state.ai.get("squad1")).toEqual("MOVING");
});

it.todo("should return to closest city if squad has less than 50% hp");
