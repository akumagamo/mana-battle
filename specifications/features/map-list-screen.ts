import puppeteer from "puppeteer"
import * as game from "../dsl"

// When the Map List scene starts
// It must list all maps
// It must present a cursor, and select the first item by default
// It must present a "Select Map" option
// When selecting a map in the list, the cursor should move to it
// And the map's information should be displayed
//
// When "Select Map" is selected
// It should switch to the Map Scene
//
export default async (page: puppeteer.Page) => {
    console.log("Feature: Map List Screen")

    await game.openGame(page)
}
