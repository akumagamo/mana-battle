import puppeteer from "puppeteer"
import * as game from "../dsl"

export default async (page: puppeteer.Page) => {
    console.log(`
==================================
     Feature: Map List Screen
==================================
`)
    console.log("Scenario: Initial Elements")
    await game.openGame(page)

    // await openMapListScreen(page)
    // await listsAllMaps()
    // await firstItemInListIsSelected()
    // await cursorIsAtFirstItem()
    // await selectedItemHasInfoDisplayed()
    // await buttonIsRendered(page, "MapListScreen", "Select Map")
    // await buttonIsRendered(page, "MapListScreen", "Return")
    //
    console.log("Scenario: Item Selection")
    //
    // await allItemsCanBeSelected()
    //
    console.log("Scenario: Selecting Map")
    //
    // await clickButton(page, "MapListScreen", "Select Map")
    // await nextScreenShouldBe(page, "MapScene")
    //
    console.log("Scenario: Selecting Return")
    //
    // await clickButton(page, "MapListScreen", "Return")
    // await nextScreenShouldBe(page, "TitleScene")
}
