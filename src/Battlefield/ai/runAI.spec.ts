import map from "../../maps/green_harbor";
import aiAttack from "./aiAttack";

it("should get path to closest enemy-controlled city if ATTACK", () => {
  const state = map();

  aiAttack(state);

  expect(state.squadsInMovement.get("squad1")?.path || []).toEqual([
    { x: 6, y: 5 },
    { x: 5, y: 5 },
    { x: 4, y: 5 },
    { x: 3, y: 5 },
  ]);

  expect(state.ai.get("squad1")).toEqual("MOVING");
});

it.todo("should return to closest city if squad has less than 50% hp");
