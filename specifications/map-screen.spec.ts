import { defineFeature, loadFeature } from "jest-cucumber"
import * as game from "./dsl"
import "expect-puppeteer"

const feature = loadFeature("./specifications/features/map-screen.feature")

jest.setTimeout(20000)

defineFeature(feature, async (test) => {
    beforeAll(async () => {
        await page.goto("http://localhost:3000")
    })
    beforeEach(async () => {
        await page.reload()
        await game.nextScreenShouldBe(page, "Title Screen")
        await game.clickButton(page, "Title Screen", "New Game")
        await game.nextScreenShouldBe(page, "Map Screen")
    })

    test("Map Creation", async ({ given, then }) => {
        given("User has opened Map Screen", async () => {
            await game.currentScreenIs(page, "Map Screen")
        })

        given("User has nothing selected", async () => {
            const selectedUnit = await game.getData(
                page,
                "Map Screen",
                "selectedUnit"
            )
            expect(selectedUnit).toBeUndefined()
        })

        then("Screen presents a map", async () => {
            const isMapLoaded = await game.getData(
                page,
                "Map Screen",
                "has created map"
            )

            expect(isMapLoaded).toBeTruthy()
        })

        then("Screen presents all dispatched squads", async () => {
            return true
            await page.evaluate(async () => {
                const scene = window.game.scene.getScene("Map Screen")
                const dispatchedSquads: string[] =
                    scene.data.get("dispatchedSquads")

                const allRendered = dispatchedSquads.every((id) =>
                    scene.children.getByName(`squad-${id}`)
                )

                if (!allRendered)
                    throw new Error(
                        "Not all dispatched squads have been rendered"
                    )
            })
        })

        then("Screen presents all cities", async () => {
            await page.evaluate(() => {
                const scene = window.game.scene.getScene("Map Screen")
                const cities: string[] = scene.data.get("cities")
                const allRendered = cities.every((id) =>
                    scene.children.getByName(`city-${id}`)
                )
                if (!allRendered)
                    throw new Error("Not all cities squads have been rendered")
            })
        })

        then("Game is unpaused", async () => {
            await page.evaluate(() => {
                const scene = window.game.scene.getScene("Map Screen")
                if (scene.physics.world.isPaused)
                    throw new Error("Game is paused")
            })
        })
    })

    test("Squad Selection", ({ given, when, then }) => {
        given("User has opened Map Screen", () => {})

        given("User has nothing selected", async () => {
            await page.evaluate(() => {
                const scene = window.game.scene.getScene("Map Screen")
                const screenUI = scene.game.scene.getScene("MapScreenUI")
                const selectedUnitUI =
                    screenUI.children.getByName("Selected Unit Info")
                if (selectedUnitUI) throw new Error("There is a selected unit")
            })
        })

        when(/^User selects a (.*)$/, async (squadType: "allied" | "enemy") => {
            if (squadType === "allied") {
                await page.evaluate(() => {
                    const scene = window.game.scene.getScene("Map Screen")
                    const [squadId] = scene.data.get("playerSquads") as string[]

                    const squad = scene.children.getByName(`squad-${squadId}`)

                    if (!squad) throw new Error("Squad not created")
                    squad.emit("pointerup")
                })
            } else if (squadType === "enemy") {
                await page.evaluate(() => {
                    const scene = window.game.scene.getScene("Map Screen")
                    const [squadId] = scene.data.get("enemySquads") as string[]

                    const squad = scene.children.getByName(`squad-${squadId}`)

                    if (!squad) throw new Error("Squad not created")
                    squad.emit("pointerup")
                })
            } else throw new Error("Invalid squad type (not allied or enemy)")
        })

        then("Game is paused", async () => {
            await page.evaluate(() => {
                const scene = window.game.scene.getScene("Map Screen")
                if (!scene.physics.world.isPaused)
                    throw new Error("Game is not paused")
            })
        })

        then(
            /^the option View Squad Details is (.*)$/,
            async (visibility: "visible") => {
                await page.evaluate(() => {
                    const scene = window.game.scene.getScene("Map Screen")
                    const screenUI = scene.game.scene.getScene("MapScreenUI")
                    const button =
                        screenUI.children.getByName("View Squad Details")
                    if (!button) throw new Error("Button is not visible")
                })
            }
        )
        then(
            /^the option View Move Squad is (.*)$/,
            async (visibility: "visible" | "hidden") => {
                if (visibility === "visible") {
                    await page.evaluate(() => {
                        const scene = window.game.scene.getScene("Map Screen")
                        const screenUI =
                            scene.game.scene.getScene("Map Screen UI")
                        const button =
                            screenUI.children.getByName("Move Squad Button")
                        if (!button) throw new Error("Button is not visible")
                    })
                } else if (visibility === "hidden") {
                    await page.evaluate(() => {
                        const scene = window.game.scene.getScene("Map Screen")
                        const screenUI =
                            scene.game.scene.getScene("Map Screen UI")
                        const button =
                            screenUI.children.getByName("Move Squad Button")
                        if (button) throw new Error("Button is not visible")
                    })
                } else {
                    throw new Error("Invalid visibility")
                }
            }
        )
    })

    test("Open Squad Details", ({ given, when, then }) => {
        given("User has opened Map Screen", () => {})

        given("User has nothing selected", () => {})

        when(/^User selects a (.*)$/, (arg0) => {})

        when(/^User selects option "(.*)"$/, (arg0) => {})

        then(/^Modal "(.*)" is visible$/, (arg0) => {})
    })

    test("Squad Movement", ({ given, when, then }) => {
        given("User has opened Map Screen", () => {})

        given("User has nothing selected", () => {})

        when("User selects a friendly squad", () => {})

        when(/^User selects option "(.*)"$/, (arg0) => {})

        when("User selects a location in the map", () => {})

        then("Game is unpaused", () => {})

        then("Unit moves to that location", () => {})
    })

    test("Squad Collision (friendly on enemy)", ({ given, when, then }) => {
        given("User has opened Map Screen", () => {})

        given("User issued a move order to a squad", () => {})

        when("Squad collides with enemy", () => {})

        then(/^The "(.*)" modal is displayed$/, (arg0) => {})
    })

    test("Squad Collision (enemy on friendly)", ({ given, when, then }) => {
        given("User has opened Map Screen", () => {})

        given("An enemy squad walks toward a friendly unit", () => {})

        when("Enemy squad collides with friendly squad", () => {})

        then(/^The "(.*)" modal is displayed$/, (arg0) => {})
    })

    test("Enemy Encountered Modal", ({ given, when, then }) => {
        given("User has opened Map Screen", () => {})

        given(/^The "(.*)" modal is opened$/, (arg0) => {})

        when(/^User selects option "(.*)"$/, (arg0) => {})

        then(/^The next screen should be "(.*)"$/, (arg0) => {})
    })
})
