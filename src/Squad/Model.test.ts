import { Map } from "immutable";
import {
  changeLeader,
  changeSquadMemberPosition,
  getMember,
  makeSquad,
  makeSquadMember,
  removeMember,
  updateMember,
} from "./Model";

const defaultSquadIndex = Map({
  s1: givenASquadWithOneMember(),
});

test("Generates squads", () => {
  const squadWithLeader = givenASquadWithOneMember();

  expect(squadWithLeader).toStrictEqual(defaultSquadIndex.get("s1"));
});

test("Should get members", () => {
  const squad = givenASquadWithTwoMembers();

  expect(getMember("u1", squad).id).toBe("u1");
  expect(getMember("u2", squad).id).toBe("u2");
});

test("Should add new members", () => {
  const squad = updateMember(
    givenASquadWithTwoMembers(),
    makeSquadMember({ id: "u3" })
  );

  expect(getMember("u3", squad).id).toBe("u3");
});

test("Should change leader", () => {
  const defaultSquad = givenASquadWithTwoMembers();
  expect(defaultSquad.leader).toBe("u1");
  const squad = changeLeader("u2", defaultSquad);

  expect(squad.leader).toBe("u2");
});

test("Should remove member", () => {
  const squad = removeMember("u1", givenASquadWithTwoMembers());

  expect(squad.members.size).toBe(1);
  expect(getMember("u2", squad).id).toBe("u2");
});
test("Should update position", () => {
  const squad = changeSquadMemberPosition(
    makeSquadMember({ id: "u1" }),
    givenASquadWithTwoMembers(),
    3,
    3
  );

  expect(getMember("u1", squad)).toHaveProperty("x", 3);
  expect(getMember("u1", squad)).toHaveProperty("y", 3);
});

function givenASquadWithOneMember() {
  const sqd = makeSquad({ id: "s1", leader: "u1" });
  const member = makeSquadMember({ id: "u1", x: 2, y: 2 });
  const squadWithLeader = changeLeader("u1", updateMember(sqd, member));
  return squadWithLeader;
}

function givenASquadWithTwoMembers() {
  const sqd = givenASquadWithOneMember();
  const newMember = makeSquadMember({ id: "u2", x: 1, y: 2 });
  return updateMember(sqd, newMember);
}
