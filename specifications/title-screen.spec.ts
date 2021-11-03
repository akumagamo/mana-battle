import { defineFeature, loadFeature } from "jest-cucumber"
import * as game from "./dsl"
import "expect-puppeteer"

const feature = loadFeature("./specifications/features/title-screen.feature")

defineFeature(feature, async (test) => {
    beforeAll(async () => {
        await page.goto("http://localhost:3000")
        await game.nextScreenShouldBe(page, "TitleScene")
    })

    test("Opening the Title Screen", async ({ given, then }) => {
        given("I have started the game", async () => {})

        then("I should see the title screen", async () => {
            await game.currentScreenIs(page, "TitleScene")
        })

        then(/^I should see a "(.*)" option$/, async (btnName) => {
            await game.buttonIsRendered(page, "TitleScene", btnName)
        })

        then(/^I should see another option called "(.*)"$/, async (btnName) => {
            await game.buttonIsRendered(page, "TitleScene", btnName)
        })
    })

    test("View Credits", ({ given, when, then }) => {
        given("I have started the game", async () => {})

        when(/^I choose the "(.*)" option$/, async (btnName) => {
            await game.clickButton(page, "TitleScene", btnName)
        })

        then("I should see the credits listed", async () => {
            await game.textIsVisible(page, "TitleScene", "Game Credits")
        })

        then(/^I should see a "(.*)" option$/, async (btnName) => {
            await game.buttonIsRendered(page, "TitleScene", btnName)
        })

        when(/^I choose the "(.*)" option$/, async (btnName) => {
            await game.clickButton(page, "TitleScene", btnName)
        })

        then("I should no longer see the credits listed", async () => {
            await game.textIsNotVisible(page, "TitleScene", "Game Credits")
        })
    })

    test("Start a New Game", ({ given, when, then }) => {
        given("I have started the game", () => {})

        when(
            /^I choose the "(.*)" option$/,
            async (optionName) =>
                await game.clickButton(page, "TitleScene", optionName)
        )

        then(
            "The next screen should be the Map Screen",
            async () => await game.nextScreenShouldBe(page, "MapScene")
        )
    })
})
