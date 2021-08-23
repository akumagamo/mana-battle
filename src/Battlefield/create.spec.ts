import map from "../maps/green_harbor"
import { sceneMock } from "../test/mocks"
import create from "./create"
import update from "./update"

jest.mock("../Scenes/utils")
jest.mock("./update")
jest.mock("../Squad/ListSquadsScene/ListSquadsScene")
jest.mock("../UI/Transition")
jest.mock("./squads/startCombat")

beforeEach(() => {
    ;(update as jest.Mock).mockReset()
})

it("should not be paused after creation", () => {
    const state = map()
    create(sceneMock(), state)

    expect(state.isPaused).toBeFalsy()
})
