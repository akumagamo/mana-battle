import { Map, Range } from "immutable"
import {
    changeLeader,
    changeSquadMemberPosition,
    getMember,
    makeMember,
    removeMember,
    updateMember,
    getLeader,
    squadBuilder,
    SquadRecord,
} from "./Model"

const defaultSquadIndex = Map({
    s1: givenASquadWithOneMember(),
})

test("Generates squads", () => {
    const squadWithLeader = givenASquadWithOneMember()

    expect(squadWithLeader).toStrictEqual(defaultSquadIndex.get("s1"))
})

test("Should get members", () => {
    const squad = givenASquadWithTwoMembers()

    expect(getMember("u1", squad)?.id).toEqual("u1")
    expect(getMember("u2", squad)?.id).toBe("u2")
})

test("Should add new members", () => {
    const squad = updateMember(
        givenASquadWithTwoMembers(),
        makeMember({ id: "u3" })
    )

    expect(getMember("u3", squad)?.id).toBe("u3")
})

test("Should change leader", () => {
    const defaultSquad = givenASquadWithTwoMembers()
    expect(defaultSquad.leader).toBe("u1")
    const squad = changeLeader("u2", defaultSquad)

    expect(squad.leader).toBe("u2")
})

test("Should get leader", () => {
    const defaultSquad = givenASquadWithTwoMembers()
    expect(defaultSquad.leader).toBe("u1")
    const leader = getLeader(defaultSquad)

    expect(leader?.id).toBe("u1")
})

test("Should remove member", () => {
    const squad = removeMember("u1", givenASquadWithTwoMembers())

    expect(squad.members.size).toBe(1)
    expect(getMember("u2", squad)?.id).toBe("u2")
})
test("Should update position", () => {
    const defaultSquad = givenASquadWithTwoMembers()

    // Sanity-check
    expect(getMember("u1", defaultSquad)).toHaveProperty("x", 2)
    expect(getMember("u1", defaultSquad)).toHaveProperty("y", 2)

    const squad = changeSquadMemberPosition(
        makeMember({ id: "u1" }),
        defaultSquad,
        3,
        3
    )

    expect(getMember("u1", squad)).toHaveProperty("x", 3)
    expect(getMember("u1", squad)).toHaveProperty("y", 3)
})

function givenASquadWithOneMember() {
    return squadBuilder({
        id: "s1",
        leader: "u1",
        force: "player",
        members: [["u1", 2, 2]],
    })
}

function givenASquadWithTwoMembers() {
    return squadBuilder({
        id: "s1",
        leader: "u1",
        force: "player",
        members: [
            ["u1", 2, 2],
            ["u2", 1, 2],
        ],
    })
}

export function printSquad(squad: SquadRecord) {
    let o = Range(0, 3)
        .map(() => Range(0, 6).map(() => "-"))
        .toJS() as string[][]
    squad.members.forEach(m => {
        const { y, x } = m
        o[y - 1][x - 1] = m.id
    })

    console.log(o.map(o => o.join(" ")).join("\n"))
}
