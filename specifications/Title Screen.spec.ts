import * as game from "./dsl"
import "expect-puppeteer"

beforeAll(async () => {
    await page.goto("http://localhost:3000")
    await game.waitForSceneCreation(page, "Core Screen")
})

describe("Title Screen", () => {

    describe("Opening the Title Screen", () => {
        openTitleScreen()

        test("I should be in the Title Screen", async () => {
            await game.currentScreenIs(page, "Title Screen")
        })

        const visibleOptions = [["New Game"], ["Credits"]]

        test.each(visibleOptions)(
            'I should see an option called "%s"',
            async (btnName) => {
                await optionIsVisible(btnName)
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
        test("Then the next screen should be the 'Map Screen'", async () =>
            await game.waitForSceneCreation(page, "Map Screen"))

    })
})

const choose = (label: string) => game.clickButton(page, "Title Screen", label)

const optionIsVisible = (label: string) =>
    game.buttonIsRendered(page, "Title Screen", label)

const textIsVisible = (text: string) =>
    game.textIsVisible(page, "Title Screen", text)

const textIsNotVisible = (text: string) =>
    game.textIsNotVisible(page, "Title Screen", text)

function openTitleScreen() {
    beforeAll(async () => {
      await page.evaluate(()=>{
        window.game.scene.remove('Title Screen')
        window.game.events.emit('Start Title Screen')
      });
    })
}
