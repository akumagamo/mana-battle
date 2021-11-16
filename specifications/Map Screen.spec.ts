import * as game from "./dsl"
import "expect-puppeteer"
import {
    setSceneParameters,
    MapScreenProperties,
    SquadIndex,
} from "../modules/MapScene/Model"

jest.setTimeout(30000)

beforeAll(async () => {
    await page.goto("http://localhost:3000")
})

const defaultSquads = [
    { x: 100, y: 100, id: "a1", force: "PLAYER" },
    { x: 200, y: 200, id: "e1", force: "CPU" },
]

const defaultCities = [
    { x: 50, y: 50, id: "c1", force: "PLAYER" },
    { x: 250, y: 250, id: "c2", force: "CPU" },
]

const defaultParameters: MapScreenProperties = {
    squads: defaultSquads,
    cities: defaultCities,
}

describe("Map Screen", () => {
    describe("Map Creation", () => {
        openMapScreen(defaultParameters)

        test("I should be in the Map Screen", async () => {
            await game.currentScreenIs(page, "Map Screen")
        })

        test("I have nothing selected", async () => {
            const selectedUnit = await game.getData(
                page,
                "Map Screen",
                "selectedUnit"
            )
            expect(selectedUnit).toBeUndefined()
        })

        test("I should see the map", async () => {
            const types = await page.evaluate(() => {
                return window.game.scene
                    .getScene("Map Screen")
                    .children.list.map((child) => child.type)
            })

            expect(types).toContain("TilemapLayer")
        })

        test("I should see all dispatched squads", async () => {
            await page.evaluate(() => {
                const scene = window.game.scene.getScene("Map Screen")
                const squads: SquadIndex = scene.data.get("_state").squads

                const allRendered = squads.every((squad) => 
                    Boolean(scene.children.getByName(
                        `squad-${squad.id.get("squad")}`
                    ))
                )

                if (!allRendered)
                    throw new Error(
                        "Not all dispatched squads have been rendered"
                    )
            })
        })

        //     then("Screen presents all cities", async () => {
        //         await page.evaluate(() => {
        //             const scene = window.game.scene.getScene("Map Screen")
        //             const cities: string[] = scene.data.get("cities")
        //             const allRendered = cities.every((id) =>
        //                 scene.children.getByName(`city-${id}`)
        //             )
        //             if (!allRendered)
        //                 throw new Error("Not all cities squads have been rendered")
        //         })
        //     })

        test("Game is unpaused", async () => {
            await page.evaluate(() => {
                const scene = window.game.scene.getScene("Map Screen")
                if (scene.physics.world.isPaused)
                    throw new Error("Game is paused")
            })
        })
    })

    //test("Squad Selection", ({ given, when, then }) => {
    //    given("User has opened Map Screen", async () => {
    //        await game.currentScreenIs(page, "Map Screen")
    //    })

    //    given("Current map has two squads:", async (table) => {
    //        console.log(`.... table`, table)
    //        //await game.currentScreenIs(page, "Map Screen")
    //    })

    //    given("User has nothing selected", async () => {
    //        await page.evaluate(() => {
    //            const scene = window.game.scene.getScene("Map Screen")
    //            const screenUI = scene.game.scene.getScene("Map Screen UI")
    //            const selectedUnitUI =
    //                screenUI.children.getByName("Selected Unit Info")
    //            if (selectedUnitUI) throw new Error("There is a selected unit")
    //        })
    //    })

    //    when(
    //        /^User selects a squad (.*):$/,
    //        async (squadType: "allied" | "enemy") => {
    //            console.log(`>>>`, squadType)
    //            return
    //            if (squadType === "allied") {
    //                await page.evaluate(() => {
    //                    const scene = window.game.scene.getScene("Map Screen")
    //                    const [squadId] = scene.data.get(
    //                        "Player Squads"
    //                    ) as string[]

    //                    const squad = scene.children.getByName(
    //                        `squad-${squadId}`
    //                    )

    //                    if (!squad) throw new Error("Squad not created")
    //                    squad.emit("pointerup")
    //                })
    //            } else if (squadType === "enemy") {
    //                await page.evaluate(() => {
    //                    const scene = window.game.scene.getScene("Map Screen")
    //                    const [squadId] = scene.data.get(
    //                        "Enemy Squads"
    //                    ) as string[]

    //                    const squad = scene.children.getByName(
    //                        `squad-${squadId}`
    //                    )

    //                    if (!squad) throw new Error("Squad not created")
    //                    squad.emit("pointerup")
    //                })
    //            } else throw new Error(`Invalid squad type: ${squadType}`)
    //        }
    //    )

    //    then("Game is paused", async () => {
    //        return true
    //        await page.evaluate(() => {
    //            const scene = window.game.scene.getScene("Map Screen")
    //            if (!scene.physics.world.isPaused)
    //                throw new Error("Game is not paused")
    //        })
    //    })

    //    then(
    //        /^the option View Squad Details is (.*)$/,
    //        async (visibility: "visible") => {
    //            return true
    //            await page.evaluate(() => {
    //                const scene = window.game.scene.getScene("Map Screen")
    //                const screenUI = scene.game.scene.getScene("Map Screen UI")
    //                const button = screenUI.children.getByName(
    //                    "View Squad Details Button"
    //                )
    //                if (!button) throw new Error("Button is not visible")
    //            })
    //        }
    //    )
    //    then(
    //        /^the option View Move Squad is (.*)$/,
    //        async (visibility: "visible" | "hidden") => {
    //            return true
    //            if (visibility === "visible") {
    //                await page.evaluate(() => {
    //                    const scene = window.game.scene.getScene("Map Screen")
    //                    const screenUI =
    //                        scene.game.scene.getScene("Map Screen UI")
    //                    const button =
    //                        screenUI.children.getByName("Move Squad Button")
    //                    if (!button) throw new Error("Button is not visible")
    //                })
    //            } else if (visibility === "hidden") {
    //                await page.evaluate(() => {
    //                    const scene = window.game.scene.getScene("Map Screen")
    //                    const screenUI =
    //                        scene.game.scene.getScene("Map Screen UI")
    //                    const button =
    //                        screenUI.children.getByName("Move Squad Button")
    //                    if (button) throw new Error("Button is not visible")
    //                })
    //            } else {
    //                throw new Error("Invalid visibility")
    //            }
    //        }
    //    )
    //})

    // test("Open Squad Details", ({ given, when, then }) => {
    //     given("User has opened Map Screen", () => {})

    //     given("User has nothing selected", () => {})

    //     when(/^User selects a (.*)$/, (arg0) => {})

    //     when(/^User selects option "(.*)"$/, (arg0) => {})

    //     then(/^Modal "(.*)" is visible$/, (arg0) => {})
    // })

    // test("Squad Movement", ({ given, when, then }) => {
    //     given("User has opened Map Screen", () => {})

    //     given("User has nothing selected", () => {})

    //     when("User selects a friendly squad", () => {})

    //     when(/^User selects option "(.*)"$/, (arg0) => {})

    //     when("User selects a location in the map", () => {})

    //     then("Game is unpaused", () => {})

    //     then("Unit moves to that location", () => {})
    // })

    // test("Squad Collision (friendly on enemy)", ({ given, when, then }) => {
    //     given("User has opened Map Screen", () => {})

    //     given("User issued a move order to a squad", () => {})

    //     when("Squad collides with enemy", () => {})

    //     then(/^The "(.*)" modal is displayed$/, (arg0) => {})
    // })

    // test("Squad Collision (enemy on friendly)", ({ given, when, then }) => {
    //     given("User has opened Map Screen", () => {})

    //     given("An enemy squad walks toward a friendly unit", () => {})

    //     when("Enemy squad collides with friendly squad", () => {})

    //     then(/^The "(.*)" modal is displayed$/, (arg0) => {})
    // })

    // test("Enemy Encountered Modal", ({ given, when, then }) => {
    //     given("User has opened Map Screen", () => {})

    //     given(/^The "(.*)" modal is opened$/, (arg0) => {})

    //     when(/^User selects option "(.*)"$/, (arg0) => {})

    //     then(/^The next screen should be "(.*)"$/, (arg0) => {})
    // })
})

function openMapScreen(params: MapScreenProperties) {
    beforeAll(async () => {
        await page.reload()
        await game.waitForSceneCreation(page, "Title Screen")

        await page.evaluate((params) => {
            window.game.registry.set("Map Screen Data", params)
        }, params)

        await game.clickButton(page, "Title Screen", "New Game")
        await game.waitForSceneCreation(page, "Map Screen")
    })
}
