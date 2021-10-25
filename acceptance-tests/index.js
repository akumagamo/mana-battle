const puppeteer = require("puppeteer")
const click = require("./DSL/click")
const dragAndDrop = require("./DSL/dragAndDrop")
const openGame = require("./Game/openGame")
const startNewGame = require("./Title/startNewGame")
const utils = require("./utils")

;(async () => {
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: {
            width: 1280,
            height: 720,
        },
    })

    const page = await browser.newPage()

    page.on("pageerror", ({ message }) => {
        console.log(message)

        page.screenshot({
            path: "screens/" + new Date().getTime() + ".png",
        }).then(() => browser.close())
    })

    console.log(`Starting tests`)

    await openGame(page)
    await page.waitForTimeout(1000)

    await startNewGame(page)
    await page.waitForTimeout(1000)

    console.log(`Tests finished`)

    await browser.close()
})()
