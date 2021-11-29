import * as dsl from "../dsl"
import "expect-puppeteer"
import {
    MapScreenProperties,
    createMapScreenProperties,
    SquadDTO,
    CityDTO,
} from "../../modules/MapScene/Model"

beforeAll(dsl.openGame)

afterAll(async () => {
    await dsl.removeScene("Map Screen")
    await dsl.removeScene("Map Screen UI")
})

const defaultParameters: MapScreenProperties = createMapScreenProperties({
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
        test(
            "Then I should see all squads",
            assertAllSquadsAreVisible(defaultParameters)
        )
        test(
            "Then I should see all cities",
            assertAllCitiesAreVisible(defaultParameters)
        )
        test("Then I the game is unpaused", gameShouldBePaused(false))
        test(
            "Then I should be able to move the map",
            mapShouldBeDraggable(true)
        )
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
                squadType: string
                canSeeEditOption: boolean
            }) => {
                test(
                    "Given that I have no squad selected",
                    assertNoEntityIsSelected
                )

                test(
                    `When I select an ${squadType} squad`,
                    dsl.click("Map Screen")(squadId)
                )

                page.waitForTimeout(10000)

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
                    dsl.click("Map Screen")(squadId)
                )

                test(
                    "Then I should still be able to move the map",
                    mapShouldBeDraggable(true)
                )

                test(
                    "When I select the Squad Details option",
                    selectOption("Map Screen UI")("View Squad Details")
                )

                test("Then I should see the Squad Details Modal", async () =>
                    dsl.checkVisibility(
                        "Map Screen UI",
                        "Squad Details Window",
                        true
                    ))

                test(
                    "Then I should no longer be able to move the map",
                    mapShouldBeDraggable(false)
                )
            }
        )
    })

    describe("Squad Movement", () => {
        describe("Move to target location", () => {
            test(
                "Given that I am selecting the target destination for a squad",
                selectMovementTargetForSquad("0")
            )
            test("When I select a location in the map", async function () {
                await page.mouse.click(150, 150)
                await page.waitForTimeout(50)
            })

            test("Then the game is unpaused", gameShouldBePaused(false))

            test("Unit moves to that location", waitForSquadArrival("0"))
        })

        describe("Selecting a squad while selecting a movement target has no effect", () => {
            test(
                "Given that I am selecting the target destination for a squad",
                selectMovementTargetForSquad("0")
            )

            test(
                "When I attempt to select the position where another unit is",
                dsl.click("Map Screen")("1")
            )

            test(
                "Then I should still be selecting a target destination",
                gameShouldBePaused(true)
            )
        })
    })

    describe("Squad Collision (friendly on enemy)", () => {
        test(
            "Given that I am selecting the target destination for a squad",
            selectMovementTargetForSquad("0")
        )
        test("Given that I issued a move order that will encounter an enemy", async function () {
            await page.mouse.click(300, 300)
        })
        test(
            "When my squad collides with the enemy",
            dsl.waitForEvent("Map Screen", "Squad Collision")
        )

        test.todo("Then I should see a Combat Preview Modal")

        test.todo(`When I select "Confirm" in the Combat Preview Modal`)

        test(
            "Then I should go to the Combat Screen",
            dsl.waitForSceneCreation("Combat Screen")
        )
    })

    describe("Squad Collision (enemy on friendly)", () => {
        test.todo(
            "Given that an enemy squad is moving towards one of my squads"
        )
        test.todo("When the enemy squad collides with my squad")

        test.todo("Then I should see a Combat Preview Modal")

        test.todo(`When I select "Confirm" in the Combat Preview Modal`)

        test.todo("Then I should go to the Combat Screen")
    })
})

function selectMovementTargetForSquad(id: string) {
    return async () => {
        await assertNoEntityIsSelected()

        await dsl.click("Map Screen")(id)()

        await selectOption("Map Screen UI")("Move Squad")()
    }
}

function should(condition: boolean) {
    return condition ? "should" : "shouldn't"
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

function assertAllCitiesAreVisible({ cities }: MapScreenProperties) {
    return async () =>
        await page.evaluate((cities: CityDTO[]) => {
            const scene = window.game.scene.getScene("Map Screen")
            const allRendered = cities.every((city) =>
                Boolean(scene.children.getByName(`city-${city.id}`))
            )
            if (!allRendered)
                throw new Error("Not all cities squads have been rendered")
        }, cities)
}

function assertAllSquadsAreVisible({ squads }: MapScreenProperties) {
    return async () =>
        await page.evaluate((squads: SquadDTO[]) => {
            const scene = window.game.scene.getScene("Map Screen")

            const allRendered = squads.every((squad) =>
                Boolean(scene.children.getByName(squad.id))
            )

            if (!allRendered)
                throw new Error("Not all squads have been rendered")
        }, squads)
}

async function assertMapIsVisible() {
    const types = await page.evaluate(() => {
        return window.game.scene
            .getScene("Map Screen")
            .children.list.map((child) => child.type)
    })

    expect(types).toContain("TilemapLayer")
}

function resetScreen(params: MapScreenProperties) {
    return async () => {
        await page.evaluate((params) => {
            window.game.scene.remove("Map Screen UI")
            window.game.scene.remove("Map Screen")
            window.game.events.emit("Start Map Screen", params)
        }, params)
    }
}

/**
 * @TODO: replace this with `waitForEvent`
 */
function waitForSquadArrival(squadId: string) {
    return async () => {
        await page.evaluate((expectedId: string) => {
            return new Promise<string>((resolve) => {
                window.game.scene
                    .getScene("Map Screen")
                    .events.once("Squad Arrived", (id: string) => {
                        if (expectedId === id) resolve(id)
                    })
            })
        }, squadId)
    }
}

/* We drag the screen by the corner, to also check if the map is draggable
 * when an modal window is opened */
function mapShouldBeDraggable(shouldBeDraggable: boolean) {
    return async () => {
        const initialPosition = await dsl.getPositonOf("Map Screen")("0")

        await dsl.drag([50, 300], [10, 150])

        const finalPosition = await dsl.getPositonOf("Map Screen")("0")

        if (shouldBeDraggable) {
            expect(finalPosition.x).toBeLessThan(initialPosition.x)
            expect(finalPosition.y).toBeLessThan(initialPosition.y)
        } else {
            expect(finalPosition).toStrictEqual(initialPosition)
        }
    }
}
