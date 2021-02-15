import { initiativeList, runCombat } from "./turns";
import { assignSquad } from "../Unit/Model";
import { makeUnit } from "../Unit/makeUnit";
import { makeSquad, makeMember } from "../Squad/Model";
import { List, Map } from "immutable";
import { equals } from "../test/utils";

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

  equals(sorted, List(["0", "3", "2", "1"]));
});

test("Combat should have the expected outcome", () => {
  const units = Map({
    "0": assignSquad(makeUnit("fighter", "0", 1), "s1"),
    "1": assignSquad(makeUnit("fighter", "1", 1), "s1"),
    "2": assignSquad(makeUnit("fighter", "2", 1), "s1"),
    "3": assignSquad(makeUnit("fighter", "3", 1), "s2"),
  });

  const squadIndex = Map({
    s1: makeSquad({
      id: "s1",
      leader: "0",
      force: "player",
      members: Map({
        "0": makeMember({ id: "0", x: 1, y: 2 }),
        "1": makeMember({ id: "1", x: 2, y: 2 }),
        "2": makeMember({ id: "2", x: 3, y: 2 }),
      }),
    }),
    s2: makeSquad({
      id: "s2",
      leader: "3",
      force: "cpu",
      members: Map({
        "3": makeMember({ id: "3", x: 1, y: 2 }),
      }),
    }),
  });

  const res = runCombat(squadIndex, units);
  equals(res.length, 25);

  const [last] = res.reverse();
  equals(last.type, "END_COMBAT");
});
