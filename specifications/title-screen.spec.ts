import * as game from "./dsl"
import "expect-puppeteer"

jest.setTimeout(30000)

beforeAll(async () => {
    await page.goto("http://localhost:3000")
})

describe("Title Screen", () => {
    describe("Opening the Title Screen", () => {
        openTitleScreen()

        it("I should be in the Title Screen", async () => {
            await game.currentScreenIs(page, "Title Screen")
        })

        const visibleOptions = [["New Game"], ["Credits"]]

        it.each(visibleOptions)(
            'I should see an option called "%s"',
            async (btnName) => {
                await optionIsVisible(btnName)
            }
        )
    })

    describe("Viewing Credits", () => {
        openTitleScreen()

        it('When I choose the "Credits" option', async () => {
            await choose("Credits")
        })

        it("Then I should see the game credits", async () => {
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

    // describe("Starting a New Game", () => {
    //     openTitleScreen()
    //     test("When I choose the 'New Game' option", async () =>
    //         await choose("New Game"))
    //     test("Then the next screen should be the 'Map Screen'", async () =>
    //         await game.nextScreenShouldBe(page, "Map Screen"))
    // })
})

const choose = (label: string) => game.clickButton(page, "Title Screen", label)

const optionIsVisible = (label: string) =>
    game.buttonIsRendered(page, "Title Screen", label)

const textIsVisible = (text: string) =>
    game.textIsVisible(page, "Title Screen", text)

const textIsNotVisible = (text: string) =>
    game.textIsNotVisible(page, "Title Screen", text)

const elementShouldExist = (name: string) =>
    game.sceneHasChild(page, "Title Screen", name, true)

const elementShouldNotExist = (name: string) =>
    game.sceneHasChild(page, "Title Screen", name, false)

function openTitleScreen() {
    beforeAll(async () => {
        await page.reload()
        await game.waitForSceneCreation(page, "Title Screen")
    })
}
