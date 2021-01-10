import { makeUnit } from "../Unit/Jobs";
import { getMeleeTarget } from "./getMeleeTarget";
import { makeTurnUnit } from "./makeTurnUnit";

jest.mock("../utils");
jest.mock("../Unit/mods");

test("Should get correct melee targets", () => {
  // Team 1 facing right =>
  //  [ 0, _, 1],
  //  [ _, _, 2],
  //  [ 4, _, 3],
  //
  // Team 2 facing right =>
  //  [ _, _, 6],
  //  [ _, 5, 7],
  //  [ _, _, 8],
  //
  // After transposing:
  //  [ 0, _, 1, 8, _, _],
  //  [ _, _, 2, 7, 5, _],
  //  [ 4, _, 3, 6, _, _],
  //
  // 0 -> 8
  // 1 -> 8
  // 2 -> 7
  // 3 -> 6
  // 4 -> 6

  const ally0 = {
    ...makeUnit("fighter", 0, 1),
    squad: { id: "1", x: 1, y: 1 },
  };
  const ally1 = {
    ...makeUnit("fighter", 1, 1),
    squad: { id: "1", x: 3, y: 1 },
  };
  const ally2 = {
    ...makeUnit("fighter", 2, 1),
    squad: { id: "1", x: 3, y: 2 },
  };
  const ally3 = {
    ...makeUnit("fighter", 3, 1),
    squad: { id: "1", x: 3, y: 3 },
  };
  const ally4 = {
    ...makeUnit("fighter", 4, 1),
    squad: { id: "1", x: 1, y: 3 },
  };

  const units = [
    ally0,
    ally1,
    ally2,
    ally3,
    ally4,
    { ...makeUnit("fighter", 5, 1), squad: { id: "2", x: 2, y: 2 } },
    { ...makeUnit("fighter", 6, 1), squad: { id: "2", x: 3, y: 1 } },
    { ...makeUnit("fighter", 7, 1), squad: { id: "2", x: 3, y: 2 } },
    { ...makeUnit("fighter", 8, 1), squad: { id: "2", x: 3, y: 3 } },
  ].map(makeTurnUnit);

  expect(getMeleeTarget(ally0, units).id).toEqual("8");
  expect(getMeleeTarget(ally1, units).id).toEqual("8");
  expect(getMeleeTarget(ally2, units).id).toEqual("7");
  expect(getMeleeTarget(ally3, units).id).toEqual("6");
  expect(getMeleeTarget(ally4, units).id).toEqual("6");
});

test("Should choose closer enemy on diagonal", () => {
  // Team 1 facing right =>
  //  [ _, _, 0],
  //  [ _, _, _],
  //  [ _, _, _],
  //
  // Team 2 facing right =>
  //  [ _, _, _],
  //  [ _, _, 3],
  //  [ 2, _, _],
  //
  // After transposing:
  //  [ _, _, 1, _, _, 2],
  //  [ _, _, _, 3, _, _],
  //  [ _, _, _, _, _, _],
  //
  // 1 -> 3
  const ally0 = {
    ...makeUnit("fighter", 0, 1),
    squad: { id: "1", x: 3, y: 1 },
  };

  const units = [
    ally0,
    { ...makeUnit("fighter", 1, 1), squad: { id: "2", x: 2, y: 2 } },
    { ...makeUnit("fighter", 2, 1), squad: { id: "2", x: 1, y: 3 } },
    { ...makeUnit("fighter", 3, 1), squad: { id: "2", x: 3, y: 2 } },
  ].map(makeTurnUnit);

  expect(getMeleeTarget(ally0, units).id).toEqual("3");
});
