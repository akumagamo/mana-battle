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
        test("Given that I have nothing selected", assertNoEntityIsSelected)
        test("Then I should see the map", assertMapIsVisible)
        test("Then I should see all squads", assertAllSquadsAreVisible)
        test("Then I should see all cities", assertAllCitiesAreVisible)
        test("Then I the game is unpaused", gameShouldBePaused(false))
    })

    describe("Squad Selection", () => {
        describe.each`
            squadId | squadType   | canSeeEditOption
            ${"0"}  | ${"allied"} | ${true}
            ${"1"}  | ${"enemy"}  | ${false}
        `(
            "$squadType squad selection",
            ({
                squadType,
                canSeeEditOption,
                squadId,
            }: {
                squadId: string
                squadType: ForceType
                canSeeEditOption: boolean
            }) => {
                test(
                    "Given that I have no squad selected",
                    assertNoEntityIsSelected
                )

                test(
                    `When I select an ${squadType} squad`,
                    selectSquad(squadId)
                )

                test("Then the game is paused", gameShouldBePaused(true))

                test(
                    `Then I should see the View Squad Details option`,
                    assertOptionVisibilityInUI({
                        optionName: "View Squad Details",
                        shouldBeVisible: true,
                    })
                )

                test(
                    `Then I ${should(
                        canSeeEditOption
                    )} see the Move Squad option`,
                    assertOptionVisibilityInUI({
                        optionName: "Move Squad",
                        shouldBeVisible: canSeeEditOption,
                    })
                )
            }
        )
    })

    describe("Open Squad Details", () => {
        describe.each`
            squadId | squadType
            ${"0"}  | ${"allied"}
            ${"1"}  | ${"enemy"}
        `(
            "view squad details for $squadType squad",
            ({
                squadId,
                squadType,
            }: {
                squadId: string
                squadType: string
            }) => {
                test(
                    "Given that I have nothing selected",
                    assertNoEntityIsSelected
                )
                test(
                    `When I select an "${squadType}" squad`,
                    selectSquad(squadId)
                )
                test(
                    "When I select the Squad Details option",
                    selectOption("Map Screen UI")("View Squad Details")
                )
                test(
                    "Then I should see the Squad Details Modal",
                    textIsVisibleInUI("These are the squad details")
                )
            }
        )
    })

    describe("Squad Movement", () => {
        test("Given that I have nothing selected", assertNoEntityIsSelected)

        test(`When I select an allied squad`, selectSquad("0"))

        test(
            "When I select the Move Squad option",
            selectOption("Map Screen UI")("Move Squad")
        )

        test.skip("When I select a location in the map", async function () {
            // const position = await page.evaluate(()=>{
            // })
            page.mouse.click(120, 120)
        })

        test.skip("Then the game is unpaused", gameShouldBePaused(false))

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
            throw new Error(`Option "${optionName}" should not be visible`)
        else if (!visible && shouldBeVisible)
            throw new Error(`Option "${optionName}" should be visible`)
    }
}

function selectOption(sceneName: string) {
    return (optionName: string) => {
        return async () =>
            await page.evaluate(
                ({ optionName, sceneName }) => {
                    const scene = window.game.scene.getScene(sceneName)

                    const option = scene.children.getByName(optionName)
                    if (!option)
                        throw new Error(
                            `Scene ${sceneName} : Option with label "${optionName}" is not visible`
                        )
                    option.emit("pointerup")
                },
                { optionName, sceneName }
            )
    }
}

function gameShouldBePaused(shouldBePaused: boolean) {
    return async () =>
        await page.evaluate((shouldBePaused) => {
            const scene = window.game.scene.getScene("Map Screen")
            if (shouldBePaused && !scene.physics.world.isPaused)
                throw new Error("Game is not paused")
            else if (!shouldBePaused && scene.physics.world.isPaused)
                throw new Error("Game should not be paused")
        }, shouldBePaused)
}

async function assertNoEntityIsSelected() {
    await resetScreen(defaultParameters)()
    await page.evaluate(() => {
        const screenUI = window.game.scene.getScene("Map Screen UI")
        const selectedUnitUI = screenUI.children.getByName("Selected Unit Info")
        if (selectedUnitUI) throw new Error("There is a selected unit")
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

type ForceType = "allied" | "enemy"

function resetScreen(params: MapScreenProperties) {
    return async () => {
        await page.evaluate((params) => {
            window.game.scene.remove("Map Screen UI")
            window.game.scene.remove("Map Screen")
            window.game.events.emit("Start Map Screen", params)
        }, params)
    }
}

function selectSquad(id: string) {
    return async () =>
        await page.evaluate(
            ({ id }) => {
                const scene = window.game.scene.getScene("Map Screen")

                const squad = scene.children.getByName(id)

                if (!squad) throw new Error("Squad not created")

                squad.emit("pointerup")
            },
            { id }
        )
}

function textIsVisibleInUI(text: string) {
    return async () => dsl.textIsVisible(page, "Map Screen UI", text)
}
