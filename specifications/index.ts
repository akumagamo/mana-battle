import puppeteer from "puppeteer"
import titleScreenSpecs from "./01-title-screen"
import mapScreenSpecs from "./02-map-screen"
;(async () => {
    const browser = await puppeteer.launch({
        headless: true,
        dumpio: false,
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

    await titleScreenSpecs(page)

    await mapScreenSpecs(page)

    console.log(`Tests finished`)

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
    

    await browser.close()
})()
