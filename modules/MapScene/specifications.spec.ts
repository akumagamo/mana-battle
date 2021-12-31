import * as dsl from "../_shared/dsl"
import "expect-puppeteer"
import { SquadId } from "../Battlefield/Squad"

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
        test("Then the game is unpaused", gameShouldBePaused(false))
        test(
            "Then I should be able to move the map",
            mapShouldBeDraggable(true)
        )
    })

    describe("Squad Selection", () => {
        describe.each`
            squadType     | canSeeEditOption | cursorColor
            ${"PLAYER"}   | ${true}          | ${"green"}
            ${"COMPUTER"} | ${false}         | ${"red"}
        `(
            "$squadType squad selection",
            ({
                squadType,
                canSeeEditOption,
                cursorColor,
            }: {
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
                    clickOnAnyForceSquad(squadType)
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
            squadType
            ${"PLAYER"}
            ${"COMPUTER"}
        `(
            "view squad details for $squadType squad",
            ({ squadType }: { squadType: string }) => {
                test(
                    "Given that I have nothing selected",
                    assertNoEntityIsSelected
                )
                test(
                    `When I select an "${squadType}" squad`,
                    clickOnAnyForceSquad(squadType)
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
            test("Given that I am selecting the target destination for a squad", async () => {
                const [id] = await dsl.getForceSquads("PLAYER")
                selectMovementTargetForSquad(id)
            })
            test("When I select a location in the map", async function () {
                await page.mouse.click(150, 250)
                await page.waitForTimeout(50)
            })

            test("Unit moves to that location", async () => {
                const [id] = await dsl.getForceSquads("PLAYER")
                waitForSquadArrival(id)
            })
        })

        describe("Selecting a squad while selecting a movement target has no effect", () => {
            test("Given that I am selecting the target destination for a squad", async () => {
                const [id] = await dsl.getForceSquads("PLAYER")
                selectMovementTargetForSquad(id)
            })

            test("When I attempt to select the position where another unit is", async () => {
                const [id] = await dsl.getForceSquads("COMPUTER")
                dsl.spriteEvent("Map Screen")(id, "pointerup")
            })

            test(
                "Then I should still be selecting a target destination",
                assertOptionVisibilityInUI({
                    optionName: "Select Destination",
                    shouldBeVisible: true,
                })
            )
            test("wait", async () => {
                await page.waitForTimeout(5000)
            })
        })
    })

    describe("Squad Collision (friendly on enemy)", () => {
        test("Given that I am selecting the target destination for a squad", async () => {
            const [id] = await dsl.getForceSquads("PLAYER")
            selectMovementTargetForSquad(id)
        })
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
            ${"down"}  | ${[0, 50]}
            ${"right"} | ${[50, 0]}
            ${"left"}  | ${[-50, 0]}
            ${"top"}   | ${[0, -50]}
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
                test("When I select a movement target", async () => {
                    const [id] = await dsl.getForceSquads("PLAYER")

                    await selectMovementTargetForSquad(id)()
                    await page.waitForTimeout(1000)
                })
                test(`When I select a position to the "${direction}" of the squad`, async () => {
                    const [id] = await dsl.getForceSquads("PLAYER")
                    const pos = await dsl.getPositonOf("Map Screen")(id)
                    await page.mouse.click(pos.x + x, pos.y + y)
                    await page.waitForTimeout(30)
                })
                test(`Then the sprite should face that direction`, async () => {
                    const animation = await page.evaluate(() => {
                        const ids = window
                            .mapScreen()
                            .getState()
                            .forces.get("PLAYER")
                            ?.dispatchedSquads.keySeq()
                            .toJS() as SquadId[]

                        console.log(`>>>`, ids)
                        const sqd = window.mapScreen().getSprite(ids[0])

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

function clickOnAnyForceSquad(squadType: string) {
    return async () => {
        const [id] = await dsl.getForceSquads(squadType)
        await dsl.click("Map Screen")(id)()
    }
}

function selectMovementTargetForSquad(id: string) {
    return async () => {
        await assertNoEntityIsSelected()

        //await dsl.click("Map Screen")(id)()

        await clickOnAnyForceSquad("PLAYER")()
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
        else if (!visible && shouldBeVisible) {
            const msg = `Option "${optionName}" should be visible`

            const children = await page.evaluate(() => {
                return window.game.scene
                    .getScene("Map Screen UI")
                    .children.list.map((c) => c.name)
            })

            throw new Error(
                `${msg} - Available children are: ${JSON.stringify(children)}`
            )
        }
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
            window.screenController().removeAll()
            window.screenController().screens.battlefield.start()
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
        const [id] = await dsl.getForceSquads("PLAYER")
        const initialPosition = await dsl.getPositonOf("Map Screen")(id)

        await dsl.drag([50, 300], [10, 150])

        const finalPosition = await dsl.getPositonOf("Map Screen")(id)

        if (shouldBeDraggable) {
            expect(finalPosition.x).toBeLessThan(initialPosition.x)
            expect(finalPosition.y).toBeLessThan(initialPosition.y)
        } else {
            expect(finalPosition).toStrictEqual(initialPosition)
        }
    }
}
