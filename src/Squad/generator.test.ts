import { squadGenerator } from "./generator";

test("generates units", () => {
  const squadId = "SQD1";

  const { squad, units } = squadGenerator(
    squadId,
    [
      ["fighter", [2, 1], true],
      ["archer", [2, 2], false],
    ],
    22,
    "TEST_FORCE"
  );

  expect(squad.id).toBe(squadId);

  const unit1Id = `${squadId}_unit_0`;
  const unit2Id = `${squadId}_unit_1`;

  expect(Object.keys(squad.members)).toStrictEqual([unit1Id, unit2Id]);

  expect(squad.members.get(unit1Id)).toStrictEqual({
    id: unit1Id,
    x: 2,
    y: 1,
    leader: true,
  });
  expect(squad.members.get(unit2Id)).toStrictEqual({
    id: unit2Id,
    x: 2,
    y: 2,
    leader: false,
  });

  expect(units.get(unit1Id).class).toBe("fighter");
  expect(units.get(unit2Id).class).toBe("archer");

  expect(units.get(unit1Id).lvl).toBe(22);
  expect(units.get(unit2Id).lvl).toBe(22);

  expect(units.get(unit1Id).squad).toStrictEqual(squadId);
  expect(units.get(unit2Id).squad).toStrictEqual(squadId);
});
