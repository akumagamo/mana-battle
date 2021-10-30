import puppeteer from "puppeteer"
export const wait = (time: number) => {
    return new Promise<void>((resolve) => {
        setTimeout(() => resolve(), time)
    })
}
export const screenshot = (name: string, page: puppeteer.Page) => {
    page.screenshot({ path: `acceptange-tests/screens/${name}.png` })
}
export const isSceneActive = async (key: string, page: puppeteer.Page) => {
    return await page.evaluate((k) => {
        //@ts-ignore
        return (window.game as Phaser.Game).scene.getScene(k).sys.isActive()
    }, key)
}

export const assert = (description: string, cond: boolean) => {
    if (!cond)
        throw new Error(`❌ ${description} - expected ${cond} but got ${!cond}`)
    else console.log(`✅ ${description}`)
}
