import { initiativeList, runCombat } from "./turns";
import { assignSquad } from "../Unit/Model";
import { makeUnit } from "../Unit/makeUnit";
import { makeSquad, makeSquadMember } from "../Squad/Model";
import { Map } from "immutable";

jest.mock("../utils/random");
jest.mock("../Unit/mods");

test("Should sort by initiave correctly", () => {
  const units = Map({
    "0": { ...makeUnit("fighter", 0, 1), dex: 9 },
    "1": { ...makeUnit("fighter", 1, 1), dex: 6 },
    "2": { ...makeUnit("fighter", 2, 1), dex: 7 },
    "3": { ...makeUnit("fighter", 3, 1), dex: 8 },
  });

  const sorted = initiativeList(units);

  expect(sorted).toEqual(["0", "3", "2", "1"]);
});

test("Combat should have the expected outcome", () => {
  const units = Map({
    "0": assignSquad(makeUnit("fighter", "0", 1), "player"),
    "1": assignSquad(makeUnit("fighter", "1", 1), "player"),
    "2": assignSquad(makeUnit("fighter", "2", 1), "player"),
    "3": assignSquad(makeUnit("fighter", "3", 1), "cpu"),
  });

  const squadIndex = Map({
    "1": makeSquad({
      id: "1",
      leader: "0",
      force: "player",
      members: Map({
        "0": makeSquadMember({ id: "0", x: 1, y: 2 }),
        "1": makeSquadMember({ id: "1", x: 2, y: 2 }),
        "2": makeSquadMember({ id: "2", x: 3, y: 2 }),
      }),
    }),
    "2": makeSquad({
      id: "2",
      leader: "3",
      force: "cpu",
      members: Map({
        "3": makeSquadMember({ id: "3", x: 1, y: 2 }),
      }),
    }),
  });

  console.log(squadIndex);
  const res = runCombat(squadIndex, units);
  expect(res.length).toBe(25);

  const [last] = res.reverse();
  expect(last.type).toBe("END_COMBAT");
});
