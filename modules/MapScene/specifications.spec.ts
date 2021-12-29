import * as dsl from "../_shared/dsl"
import "expect-puppeteer"

beforeAll(dsl.openGame)

afterAll(async () => {
    await dsl.removeScene("Map Screen")
    await dsl.removeScene("Map Screen UI")
})

describe("Map Screen", () => {
    describe("Map Creation", () => {
        test("Given that I have nothing selected", assertNoEntityIsSelected)
        test("Then I should see the map", assertMapIsVisible)
        test.todo("Then I should see all squads")
        test.todo("Then I should see all cities")
        test("Then I the game is unpaused", gameShouldBePaused(false))
        test(
            "Then I should be able to move the map",
            mapShouldBeDraggable(true)
        )
    })

    describe("Squad Selection", () => {
        describe.each`
            squadId | squadType   | canSeeEditOption | cursorColor
            ${"0"}  | ${"allied"} | ${true}          | ${"green"}
            ${"1"}  | ${"enemy"}  | ${false}         | ${"red"}
        `(
            "$squadType squad selection",
            ({
                squadType,
                canSeeEditOption,
                squadId,
                cursorColor,
            }: {
                squadId: string
                squadType: string
                canSeeEditOption: boolean
                cursorColor: string
            }) => {
                test(
                    "Given that I have no squad selected",
                    assertNoEntityIsSelected
                )

                test(
                    `When I select an ${squadType} squad`,
                    dsl.click("Map Screen")(squadId)
                )

                test.skip(`Then there should be a "${cursorColor}" cursor signaling that
                  the squad is selected`, () => {})
                //squadHasCursor(squadId, cursorColor)

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
                await page.mouse.click(150, 250)
                await page.waitForTimeout(50)
            })

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
                assertOptionVisibilityInUI({
                    optionName: "Select Destination",
                    shouldBeVisible: true,
                })
            )
        })
    })

    describe("Squad Collision (friendly on enemy)", () => {
        test(
            "Given that I am selecting the target destination for a squad",
            selectMovementTargetForSquad("0")
        )
        test("Given that I issued a move order that will encounter an enemy", async function () {
            await page.mouse.click(300, 100)
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

    describe("Character sprites", () => {
        describe.each`
            direction  | moveTo
            ${"down"}  | ${[100, 300]}
            ${"right"} | ${[300, 100]}
            ${"left"}  | ${[50, 100]}
            ${"top"}   | ${[100, 50]}
        `(
            `When a squad is moving to "$direction", then it should adjust its animation`,
            ({
                direction,
                moveTo,
            }: {
                direction: string
                moveTo: number[]
            }) => {
                test(
                    "Given that I have nothing selected",
                    assertNoEntityIsSelected
                )
                const [x, y] = moveTo
                test(
                    "When I select a movement target",
                    selectMovementTargetForSquad("0")
                )
                test(`When I select a position to the "${direction}" of the squad`, async () => {
                    await page.mouse.click(x, y)
                    await page.waitForTimeout(30)
                })
                test(`Then the sprite should face that direction`, async () => {
                    const animation = await page.evaluate(() => {
                        const sqd = window
                            .getMapScene()
                            .children.getByName(
                                "0"
                            ) as Phaser.Physics.Arcade.Sprite

                        return sqd.anims.getName()
                    })

                    expect(animation).toEqual(`soldier-map-walk-${direction}`)
                })
            }
        )
    })

    describe("User Interface", () => {
        describe("Stronghold option", () => {
            test.todo(`When the Map Screen UI is visible`)
            test.todo(`Then the UI should present a "Go to Stronghold" option`)
            test.todo(`When I select the "Go to Stronghold" option`)
            test.todo(`Then the camera should take me to my stronghold`)
        })
        describe("Squad List option", () => {
            test.todo(`When the Map Screen UI is visible`)
            test.todo(`Then the UI should present a "Squad List" option`)
            test.todo(`When I select the "Squad List" option`)
            test.todo(`Then a Squad List Modal should be presented`)
        })
        describe("City List option", () => {
            test.todo(`When the Map Screen UI is visible`)
            test.todo(`Then the UI should present a "City List" option`)
            test.todo(`When I select the "City List" option`)
            test.todo(`Then a City List Modal should be presented`)
        })
        describe("Pause option", () => {
            test.todo(`When the Map Screen UI is visible`)
            test.todo(`When the game is unpaused`)
            test.todo(`Then the UI should present a "Pause" option`)
            test.todo(`When I select the "Pause" option`)
            test.todo(`Then the game is paused`)
        })
        describe("Unpause option", () => {
            test.todo(`When the Map Screen UI is visible`)
            test.todo(`When the game is paused`)
            test.todo(`Then the UI should present a "Unpause" option`)
            test.todo(`When I select the "Unpause" option`)
            test.todo(`Then the game should be unpaused`)
        })
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
    await resetScreen()()
    await dsl.waitForSceneCreation("Map Screen")()
    const hasSelected = await page.evaluate(() => {
        const cursor = window
            .getMapScene()
            .children.list.filter((element) => element.name.endsWith("cursor"))

        return cursor && cursor.length > 0
    })

    if (hasSelected) throw new Error("has an selected squad")
}

async function assertMapIsVisible() {
    const types = await page.evaluate(() => {
        return window.getMapScene().children.list.map((child) => child.type)
    })

    expect(types).toContain("TilemapLayer")
}

function resetScreen() {
    return async () => {
        await page.evaluate(() => {
            window.game.scene.remove("Map Screen UI")
            window.game.scene.remove("Map Screen")
            window.game.events.emit("Start Map Screen")
        })
    }
}

/**
 * @TODO: replace this with `waitForSquaEvent`
 */
function waitForSquadArrival(squadId: string) {
    return async () => {
        await page.evaluate((id: string) => {
            return new Promise<void>((resolve) => {
                window.game.scene
                    .getScene("Map Screen")
                    .children.getByName(id)
                    ?.on("Arrived at target", () => {
                        resolve()
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