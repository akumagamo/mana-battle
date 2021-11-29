import * as dsl from "../dsl"
import "expect-puppeteer"

beforeAll(dsl.openGame)

afterAll(async () => {
    await dsl.removeScene("Title Screen")
})

describe("Title Screen", () => {
    describe("Opening the Title Screen", () => {
        openTitleScreen()

        test.each`
            optionName
            ${"New Game"}
            ${"Credits"}
        `(
            "I should see an option called $optionName",
            async ({ optionName }: { optionName: string }) => {
                await optionIsVisible(optionName)
            }
        )
    })

    describe("Viewing Credits", () => {
        openTitleScreen()

        test('When I choose the "Credits" option', async () => {
            await choose("Credits")
        })

        test("Then I should see the game credits", async () => {
            await textIsVisible("Game Credits")
        })

        test('Then I should see a "Close Credits" option', async () => {
            await optionIsVisible("Close Credits")
        })

        test('When I select the "Close Credits" option', async () => {
            await choose("Close Credits")
        })

        test("I should no longer see the game credits", async () => {
            await textIsNotVisible("Game Credits")
        })
    })

    describe("Starting a New Game", () => {
        openTitleScreen()
        test("When I choose the 'New Game' option", async () =>
            await choose("New Game"))
        test(
            "Then the next screen should be the 'Map Screen'",
            dsl.waitForSceneCreation("Map Screen")
        )
    })
})

const choose = (label: string) => dsl.clickButton("Title Screen", label)

const optionIsVisible = (label: string) =>
    dsl.buttonIsRendered("Title Screen", label)

const textIsVisible = (text: string) => dsl.textIsVisible("Title Screen", text)

const textIsNotVisible = (text: string) =>
    dsl.textIsNotVisible("Title Screen", text)

function openTitleScreen() {
    beforeAll(async () => {
        await page.evaluate(() => {
            window.game.scene.remove("Title Screen")
            window.game.events.emit("Start Title Screen")
        })
    })
}
