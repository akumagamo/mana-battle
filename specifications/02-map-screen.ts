import puppeteer from "puppeteer"
import * as game from "./dsl"

// When the Map scene starts
// It should present a map
// It should present the player's squads
// It should present enemies squads
// It should present cities
// It should present map features (mountains, forests, rivers)
//
// When a player squad is clicked
// It should present some options:
//  - View squad details
//  - Move squad
//
//  When "View squad details" is selected
//  It should list all squad units
//  It should select the squad's leader by default
//  It should present an option to close the squad's details
//  When an unit is selected
//  It should present details about that unit
//
//  When details about a friendly unit are displayed
//
// When an enemy squad is selected
//  It should list all squad units
//  It should select the squad's leader by default
//  It should present an option to close the squad's details
//  When an unit is selected
//  It should present details about that unit

export default async (page: puppeteer.Page) => {
    console.log(`Feature 02 - Map Screen`)
    await openMapScene(page)
    await game.currentScreenIs(page, "MapScene")
}

const openMapScene = async (page: puppeteer.Page) => {
    await game.openGame(page)

    await game.clickButton(page, "TitleScene", "New Game")
    await game.nextScreenShouldBe(page, "MapScene")
}
