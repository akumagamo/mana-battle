import puppeteer from "puppeteer"
import titleScreenSpecs from "./features/title-screen"
import mapScreenSpecs from "./features/map-screen"
import mapListScreenSpecs from "./features/map-list-screen"
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

    await mapListScreenSpecs(page)

    console.log(`Tests finished`)

    await browser.close()
})()
