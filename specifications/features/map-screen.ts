import puppeteer from "puppeteer"
import * as game from "../dsl"

export default async (page: puppeteer.Page) => {
    console.log(`
=============================
     Feature: Map Screen
=============================
`)

    console.log(`Scenario: Map Creation`)
    await game.openMapScene(page)
    await game.currentScreenIs(page, "MapScene")
    // await presentsAMap()
    // await presentsThePlayersSquad()
    // await presentsEnemySquads()
    // await presentsCities()
    // await presentsMountains()
    // await presentsForests()
    // await presentsWater()
    // await gameIsUnpaused()
    //
    // console.log('Scenario: Squad Selection - Friendly')
    // await selectPlayerSquad()
    // await gameIsPaused()
    // await buttonIsRendered('View Squad Details')
    // await buttonIsRendered('Move Squad')
    //
    // console.log('Scenario: Squad Selection - Enemy')
    // await selectEnemySquad()
    // await gameIsPaused()
    // await buttonIsRendered('View Squad Details')
    // await buttonIsNotRendered('Move Squad')
    //
    // console.log('Scenario: Open Squad Details - Friendly')
    // await selectPlayerSquad()
    // await clickButton('View Squad Details')
    // await modalIsPresented('Squad Details')
    //
    // console.log('Scenario: Open Squad Details - Enemy')
    // await selectEnemySquad()
    // await clickButton('View Squad Details')
    // await modalIsPresented('Squad Details')
    //
    // console.log('Scenario: Squad Movement')
    // await selectPlayerSquad()
    // await clickButton('Move')
    // await gameIsPaused()
    // await selectMapLocation()
    // await gameIsUnpaused()
    // await unitMovesToLocation()
    //
    // console.log('Scenario: Squad Movement Speed Change - Plain')
    // await selectPlayerSquad()
    // await clickButton('Move')
    // await selecteNearestPlain()
    // await unitSpeedInPlainShouldBe(100)
    //
    // console.log('Scenario: Squad Movement Speed Change - Mountain')
    // await selectPlayerSquad()
    // await clickButton('Move')
    // await selecteNearestMountain()
    // await unitSpeedInPlainShouldBe(20)
    //
    // console.log('Scenario: Squad Movement Speed Change - Forest')
    // await selectPlayerSquad()
    // await clickButton('Move')
    // await selecteNearestForest()
    // await unitSpeedInPlainShouldBe(40)
    //
    // console.log('Scenario: Squad Collision')
    // await selectPlayerSquad()
    // await clickButton('Move')
    // const enemyLocation = await getClosestEnemyLocation()
    // await selectMapLocation(enemyLocation)
    // await squadTouchesTarget()
    // await nextScreenShouldBe('CombatScene')
}
