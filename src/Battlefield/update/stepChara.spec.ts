import createChara from "../../Chara/createChara";
import { INVALID_STATE } from "../../errors";
import maps from "../../maps";
import { sceneMock } from "../../test/mocks";
import { createUnit } from "../../Unit/Model";
import { cellToScreenPosition } from "../board/position";
import { MOVE_SPEED } from "../config";
import { walkableTilesWeightsMap } from "../Model";
import stepChara from "./stepChara";

const scene = sceneMock();
const state = maps[0]();
const squad = state.squads.get("squad1");
if (!squad) throw new Error(INVALID_STATE);
const chara = createChara({ scene, unit: createUnit("enemy1") });
const cell = state.cells[3][4];
const speedModifier = walkableTilesWeightsMap.get(cell) || 0;
const nextStep = () => cellToScreenPosition({ x: 4, y: 3 });
const speed = MOVE_SPEED / speedModifier;
beforeEach(() => {
  squad.posScreen = nextStep();
});
it("should set the chara container to the squad position", () => {
  const next = nextStep();
  next.x += speed;
  stepChara(state, next, squad, chara);
  expect(chara.container.setPosition).toBeCalledWith(next.x, next.y);
});

it("should flip the character left when moving left", () => {
  chara.innerWrapper.scaleX = 1;
  stepChara(state, cellToScreenPosition({ x: 3, y: 3 }), squad, chara);

  expect(chara.innerWrapper.scaleX).toEqual(-1);
});

it("should flip the character right when moving right", () => {
  chara.innerWrapper.scaleX = -1;
  stepChara(state, cellToScreenPosition({ x: 5, y: 3 }), squad, chara);
  expect(chara.innerWrapper.scaleX).toEqual(1);
});
it("should not step beyond target - right", () => {
  const next = nextStep();
  next.x += speed * 2;
  stepChara(state, next, squad, chara);
  expect(squad.posScreen.x).toEqual(nextStep().x + speed);
});
it("should not step beyond target - left", () => {
  const next = nextStep();
  next.x -= speed * 2;
  stepChara(state, next, squad, chara);
  expect(squad.posScreen.x).toEqual(nextStep().x - speed);
});
it("should not step beyond target - top", () => {
  const next = nextStep();
  next.y -= speed * 2;
  stepChara(state, next, squad, chara);
  expect(squad.posScreen.y).toEqual(nextStep().y - speed);
});
it("should not step beyond target - bottom", () => {
  const next = nextStep();

  next.y += speed * 2;
  stepChara(state, next, squad, chara);
  expect(squad.posScreen.y).toEqual(nextStep().y + speed);
});

it("should walk on expected amount and direction, if the value is equal to the speed", () => {
  const next = nextStep();

  const directions = [
    [1, 0],
    [-1, 0],
    [0, -1],
    [0, 1],
  ];

  directions.forEach(([x, y]) => {
    squad.posScreen = nextStep();
    const step = { x: next.x + speed * x, y: next.y + speed * y };
    stepChara(state, step, squad, chara);
    expect(squad.posScreen).toEqual(step);
  });
});
