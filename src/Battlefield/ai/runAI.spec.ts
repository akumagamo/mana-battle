import map from "../../maps/green_harbor";
import aiAttack from "./aiAttack";

it("should get path to closest enemy-controlled city if ATTACK", () => {
  const state = map();

  aiAttack(state);

  expect(state.squadsInMovement.get("squad1")?.path || []).toHaveLength(4);

  expect(state.ai.get("squad1")).toEqual("MOVING");
});

it.todo("should return to closest city if squad has less than 50% hp");
