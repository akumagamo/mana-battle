import puppeteer from "puppeteer"
import Phaser from "phaser"

declare global {
    interface Window {
        game: Phaser.Game
    }
}

export const currentScreenIs = async (
    page: puppeteer.Page,
    sceneName: string
) => {
    const ok = await page.evaluate(
        async ({ sceneName }) => {
            return window.game.scene.isActive(sceneName)
        },
        { sceneName }
    )

    if (!ok) throw new Error(`Screen ${sceneName} is not active`)
    else console.log(`Screen ${sceneName} is active`)
}
export const startNewGame = async (page: puppeteer.Page) => {
    await click(1280 / 2, 768 / 2, page)
}
export const openGame = async (page: puppeteer.Page) => {
    console.log(`Go to the starting URL`)
    await page.goto("http://localhost:3000")

    await nextScreenShouldBe(page, "TitleScene")
}

export const click = async (x: number, y: number, page: puppeteer.Page) => {
    await page.waitForTimeout(300) // equals 200 actions per minute
    page.mouse.click(x, y)
}

export const dragAndDrop = async (
    from: { x: number; y: number },
    to: { x: number; y: number },
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

export async function clickButton(
    page: puppeteer.Page,
    scene: string,
    label: string
) {
    const clicked = await page.evaluate(
        async ({ scene, label }) => {
            const btn = window.game.scene
                .getScene(scene)
                .children.getByName(label)

            if (!btn) return null

            btn.emit("pointerup")
            return true
        },
        { scene, label }
    )

    if (!clicked)
        throw new Error(
            `Button with label ${label} on scene ${scene} couldn't be clicked.`
        )
    else
        console.log(`Clicked on button with label ${label} on screen ${scene}.`)
}

export async function buttonIsRendered(
    page: puppeteer.Page,
    scene: string,
    label: string
) {
    const ok = await page.evaluate(
        ({ scene, label }) => {
            const btn = window.game.scene
                .getScene(scene)
                .children.getByName(label)

            if (!btn) return false

            const { x, y } = (btn as Phaser.GameObjects.Container).getBounds()

            // Check that button is inside screen
            return (
                //@ts-ignore
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
export async function textIsVisible(
    page: puppeteer.Page,
    scene: string,
    label: string
) {
    const isVisible = await page.evaluate(
        async ({ scene, label }) => {
            const text = window.game.scene
                .getScene(scene)
                .children.list.find(
                    (el) => (el as Phaser.GameObjects.Text).text === label
                )
            //@ts-ignore
            return text && text.visible
        },
        { scene, label }
    )

    if (!isVisible)
        throw new Error(
            `Text with label ${label} on scene ${scene} is not present.`
        )
    else console.log(`Text with label ${label} on scene ${scene} was found.`)
}
export async function nextScreenShouldBe(page: puppeteer.Page, screen: string) {
    console.log(`Next screen should be ${screen}...`)
    await page.evaluate(
        ({ screen }) => {
            return new Promise<void>((resolve) => {
                window.game.events.once(screen + "Created", () => {
                    resolve()
                })
            })
        },
        { screen }
    )
}
