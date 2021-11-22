import * as dsl from "../dsl"
import "expect-puppeteer"
import {
    MapScreenProperties,
    SquadIndex,
    CityIndex,
    createMapScreenProperties,
    MapSceneState,
    Squad,
} from "../../modules/MapScene/Model"

dsl.openGame()

afterAll(async () => {
    await dsl.removeScene("Map Screen")
    await dsl.removeScene("Map Screen UI")
})

const defaultParameters = createMapScreenProperties({
    squads: [
        [100, 100, "PLAYER"],
        [200, 200, "CPU"],
    ],
    cities: [
        [50, 50, "PLAYER"],
        [250, 250, "CPU"],
    ],
})

describe("Map Screen", () => {
    describe("Map Creation", () => {
        openMapScreen(defaultParameters)
        test("I should be in the Map Screen", assertCurrentScreen)
        test("I have nothing selected", assertNothingSelected)
        test("I should see the map", assertMapIsVisible)
        test("I should see all squads", assertAllSquadsAreVisible)
        test("I should see all cities", assertAllCitiesAreVisible)
        test("Game is unpaused", assertGameIsUnpaused)
    })

    describe("Squad Selection", () => {
        describe.each`
            squadType   | canSeeEditOption
            ${"allied"} | ${true}
            ${"enemy"}  | ${false}
        `(
            "$squadType squad selection",
            ({
                squadType,
                canSeeEditOption,
            }: {
                squadType: ForceType
                canSeeEditOption: boolean
            }) => {
                openMapScreen(defaultParameters)

                test("When I have no squad selected", assertNoEntityIsSelected)

                test(
                    `When I select an ${squadType} squad`,
                    selectSquadOfType(squadType)
                )

                test(
                    "Then I should see that the game is paused",
                    assertGameIsPaused
                )

                test(
                    `Then I should see the View Squad Details option`,
                    assertOptionVisibilityInUI({
                        optionName: "View Squad Details Button",
                        shouldBeVisible: true,
                    })
                )

                test(
                    `Then I ${should(
                        canSeeEditOption
                    )} see the View Move Squad option`,
                    assertOptionVisibilityInUI({
                        optionName: "Move Squad Button",
                        shouldBeVisible: canSeeEditOption,
                    })
                )
            }
        )
    })

    describe("Open Squad Details", () => {
        test.todo("User has opened Map Screen")

        test.todo("User has nothing selected")

        test.todo("/^User selects a x")

        test.todo("/^User selects option x")

        test.todo('/^Modal "(.*)" is visible$/')
    })

    describe("Squad Movement", () => {
        test.todo("User has opened Map Screen")

        test.todo("User has nothing selected")

        test.todo("User selects a friendly squad")

        test.todo('/^User selects option "(.*)"$/')

        test.todo("User selects a location in the map")

        test.todo("Game is unpaused")

        test.todo("Unit moves to that location")
    })

    describe("Squad Collision (friendly on enemy)", () => {
        test.todo("User has opened Map Screen")

        test.todo("User issued a move order to a squad")

        test.todo("Squad collides with enemy")

        test.todo('/^The "(.*)" modal is displayed$/')
    })

    describe("Squad Collision (enemy on friendly)", () => {
        test.todo("User has opened Map Screen")

        test.todo("An enemy squad walks toward a friendly unit")

        test.todo("Enemy squad collides with friendly squad")

        test.todo('/^The "(.*)" modal is displayed$/')
    })

    describe("Enemy Encountered Modal", () => {
        test.todo("User has opened Map Screen")

        test.todo('/^The "(.*)" modal is opened$/')

        test.todo('/^User selects option "(.*)"$/')

        test.todo('/^The next screen should be "(.*)"$/')
    })
})

function should(condition: boolean) {
    return condition ? "should" : "shouldn't"
}

function is(condition: boolean) {
    return condition ? "is" : "isn't"
}

function assertOptionVisibilityInUI({
    optionName,
    shouldBeVisible,
}: {
    optionName: string
    shouldBeVisible: boolean
}) {
    return async () => {
        const visible = await page.evaluate(
            ({ optionName }) => {
                const screenUI = window.game.scene.getScene("Map Screen UI")
                const button = screenUI.children.getByName(optionName)
                return Boolean(button)
            },
            { optionName }
        )

        if (visible && !shouldBeVisible)
            throw new Error(`Button "${optionName}" should not be visible`)
        else if (!visible && shouldBeVisible)
            throw new Error(`Button "${optionName}" should be visible`)
    }
}

async function assertGameIsPaused() {
    await page.evaluate(() => {
        const scene = window.game.scene.getScene("Map Screen")
        if (!scene.physics.world.isPaused) throw new Error("Game is not paused")
    })
}

async function assertNoEntityIsSelected() {
    await page.evaluate(() => {
        const screenUI = window.game.scene.getScene("Map Screen UI")
        const selectedUnitUI = screenUI.children.getByName("Selected Unit Info")
        if (selectedUnitUI) throw new Error("There is a selected unit")
    })
}

async function assertGameIsUnpaused() {
    await page.evaluate(() => {
        const scene = window.game.scene.getScene("Map Screen")
        if (scene.physics.world.isPaused) throw new Error("Game is paused")
    })
}

async function assertAllCitiesAreVisible() {
    await page.evaluate(() => {
        const scene = window.game.scene.getScene("Map Screen")
        const cities: CityIndex = scene.data.get("_state").cities
        const allRendered = cities.every((city) =>
            Boolean(scene.children.getByName(`city-${city.id.get("city")}`))
        )
        if (!allRendered)
            throw new Error("Not all cities squads have been rendered")
    })
}

async function assertAllSquadsAreVisible() {
    await page.evaluate(() => {
        const scene = window.game.scene.getScene("Map Screen")
        const squads: SquadIndex = scene.data.get("_state").squads

        const allRendered = squads.every((squad) =>
            Boolean(scene.children.getByName(squad.id.get("squad", "")))
        )

        if (!allRendered) throw new Error("Not all squads have been rendered")
    })
}

async function assertMapIsVisible() {
    const types = await page.evaluate(() => {
        return window.game.scene
            .getScene("Map Screen")
            .children.list.map((child) => child.type)
    })

    expect(types).toContain("TilemapLayer")
}

async function assertNothingSelected() {
    const selectedUnit = await dsl.getData(page, "Map Screen", "selectedUnit")
    expect(selectedUnit).toBeUndefined()
}

function openMapScreen(params: MapScreenProperties) {
    beforeAll(async () => {
        await page.evaluate((params) => {
            window.game.scene.remove("Map Screen UI")
            window.game.scene.remove("Map Screen")
            window.game.events.emit("Start Map Screen", params)
        }, params)
    })
}

type ForceType = "allied" | "enemy"
function selectSquadOfType(squadType: ForceType) {
    return async () => {
        if (squadType === "allied") {
            selectAnySquadFromForce("PLAYER")
        } else if (squadType === "enemy") {
            selectAnySquadFromForce("CPU")
        } else throw new Error(`Invalid squad type: ${squadType}`)
    }
}
async function assertCurrentScreen() {
    await dsl.currentScreenIs(page, "Map Screen")
}

async function selectAnySquadFromForce(force: string) {
    await page.evaluate(
        ({ force }) => {
            const scene = window.game.scene.getScene("Map Screen")
            console.log(scene.data.get("_state"))
            const first = (
                scene.data.get("_state") as MapSceneState
            ).squads.find((s: Squad) => s.force.get("force") === force)

            if (!first) throw new Error("No squad for selection")

            const squadId = first.id.get("squad")

            if (!squadId) throw new Error("Invalid squad: no id")

            const squad = scene.children.getByName(squadId)

            if (!squad) throw new Error("Squad not created")

            squad.emit("pointerup")
        },
        { force }
    )
}
