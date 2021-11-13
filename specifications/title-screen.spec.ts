import * as game from "./dsl"
import "expect-puppeteer"

jest.setTimeout(30000)

describe("Title Screen", () => {
    beforeAll(async () => {
        await page.goto("http://localhost:3000")
    })

    beforeEach(async () => {
        await page.reload()
        await game.nextScreenShouldBe(page, "Title Screen")
    })

    describe("Opening the Title Screen", () => {
        test("I should be in the Title Screen", async () => {
            await game.currentScreenIs(page, "Title Screen")
        })

        it.each([["New Game"], ["Credits"]])(
            'I should seen an option called "%s"',
            async (btnName) => {
                await game.buttonIsRendered(page, "Title Screen", btnName)
            }
        )
    })

    describe("Viewing Credits", () => {
        test('When I choose the "Credits" option', async () => {
            await game.clickButton(page, "Title Screen", "Credits")
        })

        test("Then I should see the Credits ", async () => {
            await game.textIsVisible(page, "Title Screen", "Game Credits")
        })

        test('Then I should see a "Close Credits" option', async () => {
            await game.buttonIsRendered(page, "Title Screen", "Close Credits")
        })

        test('When I select the "Close Credits" option', async () => {
            await game.clickButton(page, "Title Screen", "Close Credits")
        })

        test("I should no longer see the Credits", async () => {
            await game.textIsNotVisible(page, "Title Screen", "Game Credits")
        })
    })

    test("Starting a New Game", () => {
        test("When I choose the 'New Game' option", async () =>
            await game.clickButton(page, "Title Screen", "New Game"))

        test("Then the next screen should be the 'Map Screen'", async () =>
            await game.nextScreenShouldBe(page, "Map Screen"))
    })
})
