import { MapSquad } from "../Battlefield/Model"
import { getChara } from "../Chara/Model"
import map from "../maps/green_harbor"
import { sceneMock } from "../test/mocks"
import { getUnit, Unit } from "../Unit/Model"
import create from "./create"
import { CombatCreateParams } from "./Model"

jest.mock("../Chara/ui/hpBar")

it("should render all living units", async () => {
    const state = await mount({})
    expect(state.unitSquadIndex.size).toEqual(state.charaIndex.size)
})
it("should not render dead units", async () => {
    const props = defaultProps()
    const state = await mount({
        ...props,
        units: props.units.update((props.units.first() as Unit).id, x => ({
            ...x,
            currentHp: 0,
        })),
    })
    expect(state.charaIndex.size).toEqual(state.unitIndex.size - 1)
})

it("characters on the left side should not be flipped", async () => {
    const props = defaultProps()
    const state = await mount(props)

    state.squadIndex
        .filter(sqd => sqd.id === props.left)
        .forEach(sqd => {
            sqd.members
                .map(m => getChara(m.id, state.charaIndex))
                .forEach(chara =>
                    expect(chara.sprite.toggleFlipX).not.toHaveBeenCalled()
                )
        })
})

it("characters on the right side should be flipped", async () => {
    const props = defaultProps()
    const state = await mount(props)

    state.squadIndex
        .filter(sqd => sqd.id === props.right)
        .forEach(sqd => {
            sqd.members
                .map(m => getChara(m.id, state.charaIndex))
                .forEach(chara =>
                    expect(chara.sprite.toggleFlipX).toHaveBeenCalled()
                )
        })
})

const defaultProps = () => {
    const testMap = map()

    return {
        left: (testMap.squads.first() as MapSquad).id,
        right: (testMap.squads.last() as MapSquad).id,
        squads: testMap.squads.map(s => s.squad),
        units: testMap.units,
    }
}

async function mount(overrides: CombatCreateParams | {} = {}) {
    const scene = sceneMock()

    return await create({ ...defaultProps(), ...overrides }, scene)
}
