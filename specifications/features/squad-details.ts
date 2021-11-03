import puppeteer from "puppeteer"
import * as game from "../dsl"

type Scenario = {
    title: string
    given: { [precondition: string]: string }
    when: { [event: string]: string }
    then: string[]
}

const testScenario = {
    title: "Initial State (friendly, dispatched)",
    given: { squad: "A friendly and dispatched squad" },
    when: { "squad details": "I open the details for <squad>" },
    then: [
        "All units in <squad> are listed on <squad details>",
        "The leader of <squad> is selected on <squad details>",
        "An option to <close details modal> is presented",
        "An option to <change unit position> is presented",
        "An option to <add unit to squad> is not presented",
        "An option to <remove unit from squad> is not presented",
    ],
}

function processScenario(scenario: Scenario, fns: { [fn: string]: () => any }) {
    console.log(`Scenario: ${scenario.title}`)

    const givens = Object.entries(scenario.given).reduce(
        (xs, [k, v]) => ({ ...xs, [k]: fns[v]() }),
        {}
    )

    console.log(givens)
}

const fns = {
    "A friendly and dispatched squad": () => 22,
}

processScenario(testScenario, fns)

const create = (page: puppeteer.Page) => {
    return {
        spec: (keys: string[]) => {
            const index: { [x: string]: () => Promise<void> } = {
                "User opens Squad Details for friendly and dispatched squad":
                    () => Promise.resolve(),
            }

            keys.reduce(async (xs, x) => {
                await xs
                const fn = index[x]
                if (fn) return fn()
                else {
                    console.log(`unknown key`, x)

                    return Promise.resolve()
                }
            }, Promise.resolve())
        },
    }
}
// check jest cucumber to be able to run multiple tests in parallel
export default async (page: puppeteer.Page) => {
    const { spec } = create(page)
    console.log(
        "Scenario: Squad Details - Initial State (friendly, dispatched)"
    )
    spec(["User opens Squad Details for friendly and dispatched squad"])
    // await detailsModal = viewDetailsForSquad(squad)
    // await allUnitsAreListed(squad, detailsModal)
    // await leaderIsSelected(squad, detailsModal)
    // await buttonIsRendered(SQUAD_DETAILS_CLOSE_MODAL)
    // await buttonIsRendered(SQUAD_DETAILS_MOVE_UNIT)
    // await buttonIsNotRendered(SQUAD_DETAILS_ADD_UNIT)
    // await buttonIsNotRendered(SQUAD_DETAILS_REMOVE_UNIT)
    //
    // console.log('Scenario: Squad Details - Initial State (friendly, non-dispatched)')
    // await viewDetailsForFriendlySquad()
    // await listsAllUnitsInSquad()
    // await leaderIsSelected()
    // await aCursorIsPresented()
    // await detailsAboutSelectedUnitArePresented()
    // await buttonIsRendered(SQUAD_DETAILS_CLOSE_MODAL)
    // await buttonIsRendered(SQUAD_DETAILS_MOVE_UNIT)
    // await buttonIsRendered(SQUAD_DETAILS_ADD_UNIT)
    // await buttonIsRendered(SQUAD_DETAILS_REMOVE_UNIT)
    //
    // console.log('Scenario: Squad Details - Initial State (enemy)')
    // await viewDetailsForFriendlySquad()
    // await listsAllUnitsInSquad()
    // await leaderIsSelected()
    // await aCursorIsPresented()
    // await detailsAboutSelectedUnitArePresented()
    // await buttonIsRendered(SQUAD_DETAILS_CLOSE_MODAL)
    // await buttonIsNotRendered(SQUAD_DETAILS_MOVE_UNIT)
    // await buttonIsNotRendered(SQUAD_DETAILS_ADD_UNIT)
    // await buttonIsNotRendered(SQUAD_DETAILS_REMOVE_UNIT)
    //
    // console.log('Scenario: Squad Details - Friendly - Unit Selection')
    // await viewDetailsForFriendlySquad()
    // await selectUnitInList()
    // await detailsAboutSelectedUnitArePresented()
    // await allUnitsCanBeSelected()
    //
    // console.log('Scenario: Squad Details - Friendly - Close Modal')
    // await viewDetailsForFriendlySquad()
    // await clickButton('Close Squad Details')
    // await modalIsNotPresented('Squad Details')
    //
    // console.log('Scenario: Squad Details - Friendly - Move Units')
    // await viewDetailsForFriendlySquad()
    // await moveUnitToEmptySpace()
    // await moveUnitToOccupiedSpace()
    // await clickButton('Close Squad Details')
    // await viewDetailsForFriendlySquad()
    // await unitsAreInPositions()
    //
    // console.log('Scenario: Squad Details - Enemy - Initial State')
    // await viewDetailsForEnemySquad()
    // const units = getAllListedUnits()
    // await allUnitsAreVisible(units)
    // await leaderIsSelected()
    // await aCursorIsPresented()
    // await detailsAboutSelectedUnitArePresented()
    // await buttonIsRendered('Close Squad Details')
    //
    // console.log('Scenario: Squad Details - Enemy - Unit Selection')
    // await viewDetailsForEnemySquad()
    // const units = getAllListedUnits()
    // const canBeSelected = compose([isVisible, showsInfoWhenSelected, showsCursorWhenSelected])
    // await canBeSelected(units)
    //
    // console.log('Scenario: Squad Details - Enemy - Close Modal')
    // await viewDetailsForEnemySquad()
    // await clickButton('Close Squad Details')
    // await modalIsNotPresented('Squad Details')
    //
    // console.log('Scenario: Squad Details - Friendly - Add Unit to empty space')
    // await viewDetailsForFriendlySquad()
    // await addUnitToEmptySpace()
    // await clickButton('Close Squad Details')
    // await viewDetailsForFriendlySquad()
    // await unitHasBeenAdded()
    //
    // console.log('Scenario: Squad Details - Friendly - Add Unit to occupied space (not leader)')
    // await viewDetailsForFriendlySquad()
    // await addUnitToOccupiedSpace()
    // await textIsVisible('Are you sure? The will remove the existing unit.')
    // await clickButton('Confirm Replace')
    // await clickButton('Close Squad Details')
    // await viewDetailsForFriendlySquad()
    // await newUnitHasBeenAdded()
    // await oldUnitHasBeenRemoved()
    //
    // console.log('Scenario: Squad Details - Friendly - Add Unit to occupied space (leader)')
    // await viewDetailsForFriendlySquad()
    // await addUnitToOccupiedSpace()
    // await textIsVisible('You can't replace the squad leader.')
    // await clickButton('Confirm')
    // await clickButton('Close Squad Details')
    // await viewDetailsForFriendlySquad()
    // await newUnitHasNotBeenAdded()
    // await oldUnitHasNotBeenRemoved()
    //
    // console.log('Scenario: Squad Details - Friendly - Remove Unit (not leader)')
    // await viewDetailsForFriendlySquad()
    // await addUnitToEmptySpace()
    // await clickButton('Close Squad Details')
    // await viewDetailsForFriendlySquad()
    // await unitHasBeenRemoved()
    //
    // console.log('Scenario: Squad Details - Friendly - Remove Unit (leader) - Confirm')
    // await viewDetailsForFriendlySquad()
    // await removeLeader()
    // await warningIsVisible(CONFIRM_REMOVE_LEADER_DISBANDS_SQUAD)
    // await clickButton('Confirm')
    // await noWarningIsVisible()
    // await squadHasBeenDIsbanded()
    //
    // console.log('Scenario: Squad Details - Friendly - Remove Unit (leader) - Cancel')
    // await viewDetailsForFriendlySquad()
    // await removeLeader()
    // await warningIsVisible(CONFIRM_REMOVE_LEADER_DISBANDS_SQUAD)
    // await clickButton('Cancel')
    // await noWarningIsVisible()
    // await modalIsPresented('SquadDetails')
    //
}
