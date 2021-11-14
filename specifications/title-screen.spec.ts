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

        const visibleOptions = [["New Game"], ["Credits"]]

        it.each(visibleOptions)(
            'I should seen an option called "%s"',
            async (btnName) => {
                await optionIsVisible(btnName)
            }
        )
    })

    describe("Viewing Credits", () => {
        test('When I choose the "Credits" option', async () => {
            await click("Credits")
        })

        test("Then I should see the Credits ", async () => {
            await elementShouldExist("Credits Window")
        })

        test('Then I should see a "Close Credits" option', async () => {
            await optionIsVisible("Close Credits")
        })

        test('When I select the "Close Credits" option', async () => {
            await click("Close Credits")
        })

        test("I should no longer see the Credits", async () => {
            await textIsNotVisible("Game Credits")
        })
    })

    describe("Starting a New Game", () => {
        test("When I choose the 'New Game' option", async () =>
            await click("New Game"))
        test("Then the next screen should be the 'Map Screen'", async () =>
            await game.nextScreenShouldBe(page, "Map Screen"))
    })
})

const click = (label: string) => game.clickButton(page, "Title Screen", label)

const optionIsVisible = (label: string) =>
    game.buttonIsRendered(page, "Title Screen", label)

const textIsVisible = (text: string) =>
    game.textIsVisible(page, "Title Screen", text)

const textIsNotVisible = (text: string) =>
    game.textIsNotVisible(page, "Title Screen", text)

const elementShouldExist = (name: string) =>
    game.elementShouldExist(page, "Title Screen", name)
