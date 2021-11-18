import * as game from "./dsl"
import "expect-puppeteer"
import {
    MapScreenProperties,
    SquadIndex,
    CityIndex,
    createMapScreenProperties,
} from "../modules/MapScene/Model"

beforeAll(async () => {
    await page.goto("http://localhost:3333")
    await game.waitForSceneCreation(page, "Core Screen")
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
        test.skip("User has nothing selected", assertNoEntityIsSelected)

        test.skip.each(["allied", "enemy"] as ForceType[])(
            "When I select an %s squad",
            selectSquadOfType
        )

        test.skip("Game is paused", assertGameIsPaused)

        test.skip(
            "the option View Squad Details is not visible",
            assertOptionInUIIsNotVisible("View Squad Details Button")
        )
        test.skip(
            "The option View Move Squad is visible",
            assertOptionInUIIsVisible("Move Squad Button")
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

function assertOptionInUIIsVisible(option: string) {
    return async () => {
        await page.evaluate(() => {
            const scene = window.game.scene.getScene("Map Screen")
            const screenUI = scene.game.scene.getScene("Map Screen UI")
            const button = screenUI.children.getByName(option)
            if (!button) throw new Error("Button is not visible")
        })
    }
}

function assertOptionInUIIsNotVisible(option: string) {
    return async () => {
        await page.evaluate(() => {
            const scene = window.game.scene.getScene("Map Screen")
            const screenUI = scene.game.scene.getScene("Map Screen UI")
            const button = screenUI.children.getByName(option)
            if (!button) throw new Error("Button is not visible")
        })
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
        const scene = window.game.scene.getScene("Map Screen")
        const screenUI = scene.game.scene.getScene("Map Screen UI")
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
            Boolean(scene.children.getByName(`squad-${squad.id.get("squad")}`))
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
    const selectedUnit = await game.getData(page, "Map Screen", "selectedUnit")
    expect(selectedUnit).toBeUndefined()
}

function openMapScreen(params: MapScreenProperties) {
    beforeAll(async () => {
        await page.evaluate((params) => {
            window.game.scene.remove("Map Screen")
            window.game.events.emit("Start Map Screen", params)
        }, params)
    })
}

type ForceType = "allied" | "enemy"
async function selectSquadOfType(squadType: ForceType) {
    if (squadType === "allied") {
        await page.evaluate(() => {
            const scene = window.game.scene.getScene("Map Screen")
            const [squadId] = scene.data.get("Player Squads") as string[]

            const squad = scene.children.getByName(`squad-${squadId}`)

            if (!squad) throw new Error("Squad not created")
            squad.emit("pointerup")
        })
    } else if (squadType === "enemy") {
        await page.evaluate(() => {
            const scene = window.game.scene.getScene("Map Screen")
            const [squadId] = scene.data.get("Enemy Squads") as string[]

            const squad = scene.children.getByName(`squad-${squadId}`)

            if (!squad) throw new Error("Squad not created")
            squad.emit("pointerup")
        })
    } else throw new Error(`Invalid squad type: ${squadType}`)
}

async function assertCurrentScreen() {
    await game.currentScreenIs(page, "Map Screen")
}
