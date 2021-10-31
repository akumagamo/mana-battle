import puppeteer from "puppeteer"
import * as game from "../dsl"

export default async (page: puppeteer.Page) => {
    console.log(`Feature: Title Screen`)

    await game.openGame(page)
    await game.currentScreenIs(page, "TitleScene")

    await game.buttonIsRendered(page, "TitleScene", "New Game")
    await game.buttonIsRendered(page, "TitleScene", "Credits")

    await game.clickButton(page, "TitleScene", "Credits")

    await game.textIsVisible(page, "TitleScene", "Game Credits")

    await game.clickButton(page, "TitleScene", "New Game")

    await game.nextScreenShouldBe(page, "MapScene")
}
