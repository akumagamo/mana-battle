import { makeSquad, updateMember } from "./Model";

test("generates squads", () => {
  const sqd = makeSquad("id1", "force");

  expect(sqd).toStrictEqual({
    id: "id1",
    name: "",
    members: {},
    force: "force",
  });

  const member = { id: "1", x: 2, y: 2, leader: true };
  const squadWithMember = updateMember(sqd, member);

  const newLeader = { id: "2", x: 1, y: 2, leader: true };

  const replaceLeader = updateMember(squadWithMember, newLeader);

  expect(replaceLeader).toStrictEqual({
    id: "id1",
    name: "",
    members: { "1": { ...member, leader: false }, "2": newLeader },
    force: "force",
  });
});
