import puppeteer from "puppeteer"
import * as game from "../dsl"

export default (page: puppeteer.Page) => {
    // console.log('Scenario: Initial State')
    //
    // await openOrganizeScreen(page)
    // await allPlayerSquadsAreListed(page)
    // await firstSquadInTheListIsSelected(page)
    // await informationAboutFirstSquadIsDisplayed(page)
    // await buttonIsRendered(page, 'OrganizeScreen', 'Edit Squad')
    // await buttonIsRendered(page, 'OrganizeScreen', 'Remove Squad')
    // await buttonIsRendered(page, 'OrganizeScreen', 'Create Squad')
    // await buttonIsRendered(page, 'OrganizeScreen', 'Return')
    //
    // console.log('Scenario: Squad Selection')
    // await openOrganizeScreen(page)
    // await allPlayerSquadsAreListed(page)
    // await allPlayerSquadsCanBeSelected(page)
    //
    // console.log('Scenario: Squad Edit - Add Unit')
    // await openOrganizeScreen(page)
    // const await playerSquads = getAllPlayerSquads(page)
    // await Promise.all(playerSquads.map(openEditSquad . addUnitToSquad ))
    // await clickButton(page, 'OrganizeScreen', 'Confirm')
    // await Promise.all(playerSquads.map(unitHasBeenAdded))
    //
    //  console.log('Scenario: Squad Edit - Remove Unit')
    // await openOrganizeScreen(page)
    // const await playerSquads = getAllPlayerSquads(page)
    // await Promise.all(playerSquads.map(openEditSquad . removeUnitFromSquad . moveUnitToEmptySpace . moveUnitToOccupiedSpace))
    // await clickButton(page, 'OrganizeScreen', 'Confirm')
    // await Promise.all(playerSquads.map(unitHasBeenRemoved))
    //
    //   console.log('Scenario: Squad Edit - Move Unit')
    // await openOrganizeScreen(page)
    // const await playerSquads = getAllPlayerSquads(page)
    // await Promise.all(playerSquads.map(openEditSquad . moveUnitToEmptySpace . moveUnitToOccupiedSpace))
    // await clickButton(page, 'OrganizeScreen', 'Confirm')
    // await Promise.all(playerSquads.map(unitHasBeenRemoved))
}
