import { initiativeList, runCombat } from "./turns";
import { assignSquad } from "../Unit/Model";
import { makeUnit } from "../Unit/Jobs";
import { makeTurnUnit } from "./makeTurnUnit";

jest.mock("../utils/random");
jest.mock("../Unit/mods");

test("Should sort by initiave correctly", () => {
  const units = [
    { ...makeUnit("fighter", 0, 1), dex: 9 },
    { ...makeUnit("fighter", 1, 1), dex: 6 },
    { ...makeUnit("fighter", 2, 1), dex: 7 },
    { ...makeUnit("fighter", 3, 1), dex: 8 },
  ].map(makeTurnUnit);

  const sorted = initiativeList(units).map((unit) => unit.unit.id);

  expect(sorted).toEqual(["0", "3", "2", "1"]);
});

test("Combat should have the expected outcome", () => {
  const units = [
    assignSquad(makeUnit("fighter", 0, 1), { id: "1", x: 1, y: 2 }),
    assignSquad(makeUnit("fighter", 1, 1), { id: "1", x: 2, y: 2 }),
    assignSquad(makeUnit("fighter", 2, 1), { id: "1", x: 3, y: 2 }),
    assignSquad(makeUnit("fighter", 3, 1), { id: "2", x: 2, y: 2 }),
  ];

  const res = runCombat(units);
  expect(res.length).toBe(25);

  const [last] = res.reverse();
  expect(last.type).toBe("END_COMBAT");
});
