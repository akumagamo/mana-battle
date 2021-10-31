import puppeteer from "puppeteer"
import * as DSL from "./DSL"
;(async () => {
    const browser = await puppeteer.launch({
        headless: true,
        dumpio: true,
        defaultViewport: {
            width: 1280,
            height: 720,
        },
    })

    const page = await browser.newPage()

    page.on("pageerror", ({ message }: { message: string }) => {
        console.log(message)

        page.screenshot({
            path: "screens/" + new Date().getTime() + ".png",
        }).then(() => browser.close())
    })

    console.log(`Starting tests`)

    await DSL.openGame(page)
    await page.waitForTimeout(3000)

    await buttonIsRendered(page, "TitleScene", "New Game")
    await buttonIsRendered(page, "TitleScene", "Credits")

    // should see the "game start" option

    await DSL.startNewGame(page)
    await page.waitForTimeout(1000)

    console.log(`Tests finished`)

    // When the game starts
    // It should start the Title scene
    // Two options must be presented: New Game and Credits
    //
    // When New Game is selected
    // It should switch to the Map List Scene
    //
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
    //

    await browser.close()
})()

async function buttonIsRendered(
    page: puppeteer.Page,
    scene: string,
    label: string
) {
    const ok = await page.evaluate(
        ({ scene, label }) => {
            //@ts-ignore
            const btn: Phaser.GameObjects.Container | null = //@ts-ignore
            (game as Phaser.Game).scene
                .getScene(scene)
                .children.getByName(label)

            if (!btn) return false

            const { x, y } = btn.getBounds()

            // Check that button is inside screen
            return (
                btn.visible &&
                btn.type === "Container" &&
                x < window.innerWidth &&
                y < window.innerHeight
            )
        },
        { scene, label }
    )

    if (!ok)
        throw new Error(
            `Button with label ${label} not rendered on scene ${scene}`
        )
    else
        console.log(`Button with label ${label} was rendered on scene ${scene}`)
}
