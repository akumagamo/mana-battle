import puppeteer from "puppeteer"

export const startNewGame = async (page: puppeteer.Page) => {
    await click(1280 / 2, 768 / 2, page)
}
export const openGame = async (page: puppeteer.Page) => {
    await page.goto("http://localhost:3000")
}

export const click = async (x: number, y: number, page: puppeteer.Page) => {
    await page.waitForTimeout(300) // equals 200 actions per minute
    page.mouse.click(x, y)
}

export const dragAndDrop = async (
    from: {x:number, y:number},
    to: {x:number, y:number},
    page: puppeteer.Page
) => {
    await page.waitForTimeout(300)
    page.mouse.move(from.x || 0, from.y || 0)
    page.mouse.down()

    await page.waitForTimeout(100)
    page.mouse.move(to.x || 0, to.y || 0)

    await page.waitForTimeout(100)
    page.mouse.up()
}
