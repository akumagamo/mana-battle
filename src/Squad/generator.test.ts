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

  expect(Object.keys(squad.members)).toBe([unit1Id, unit2Id]);

  expect(squad.members[unit1Id]).toBe({
    id: unit1Id,
    x: 2,
    y: 1,
    leader: true,
  });
  expect(squad.members[unit2Id]).toBe({
    id: unit2Id,
    x: 2,
    y: 2,
    leader: false,
  });

  expect(units[unit1Id].class).toBe("fighter");
  expect(units[unit2Id].class).toBe("archer");

  expect(units[unit1Id].lvl).toBe(22);
  expect(units[unit2Id].lvl).toBe(22);

  expect(units[unit1Id].squad).toBe({ id: squadId, x: 2, y: 1 });
  expect(units[unit2Id].squad).toBe({ id: squadId, x: 2, y: 1 });
});
