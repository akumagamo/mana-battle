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
        it("should display the title screen", async () => {
            await game.currentScreenIs(page, "Title Screen")
        })
        // It template string example
        // it.each<{ btnName: string }>`
        //     btnName
        //     ${"New Game"}
        //     ${"Credits"}
        // `("should render %s ", async ({ btnName }) => {
        //     await game.buttonIsRendered(page, "Title Screen", btnName)
        // })
        it.each([["New Game"], ["Credits"]])(
            'should render an "%s" option',
            async (btnName) => {
                await game.buttonIsRendered(page, "Title Screen", btnName)
            }
        )
        // it.each(['New Game', 'Credits'], `should display a "%s" option `, async (btnName) => {
        // })

        // then(/^I should see another option called "(.*)"$/, async (btnName) => {
        //     await game.buttonIsRendered(page, "Title Screen", btnName)
        // })
    })

    // test("View Credits", ({ given, when, then }) => {
    //     given("I have started the game", async () => {})

    //     when(/^I choose the "(.*)" option$/, async (btnName) => {
    //         await game.clickButton(page, "Title Screen", btnName)
    //     })

    //     then("I should see the credits listed", async () => {
    //         await game.textIsVisible(page, "Title Screen", "Game Credits")
    //     })

    //     then(/^I should see a "(.*)" option$/, async (btnName) => {
    //         await game.buttonIsRendered(page, "Title Screen", btnName)
    //     })

    //     when(/^I choose the "(.*)" option$/, async (btnName) => {
    //         await game.clickButton(page, "Title Screen", btnName)
    //     })

    //     then("I should no longer see the credits listed", async () => {
    //         await game.textIsNotVisible(page, "Title Screen", "Game Credits")
    //     })
    // })

    // test("Start a New Game", ({ given, when, then }) => {
    //     given("I have started the game", () => {})

    //     when(
    //         /^I choose the "(.*)" option$/,
    //         async (optionName) =>
    //             await game.clickButton(page, "Title Screen", optionName)
    //     )

    //     then(
    //         "The next screen should be the Map Screen",
    //         async () => await game.nextScreenShouldBe(page, "Map Screen")
    //     )
    // })
})
