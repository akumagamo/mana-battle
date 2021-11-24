import dsl from "puppeteer"
import Phaser from "phaser"

declare global {
    interface Window {
        game: Phaser.Game
    }
}

const port = process.env.CI ? 3333 : 3000

export function openGame() {
    const url = `http://localhost:${port}`

    console.log(`opening ${url}`)
    beforeAll(async () => {
        await page.goto(url)
        await waitForSceneCreation(page, "Core Screen")
    })
}

export async function removeScene(scene: string) {
    await page.evaluate((scene) => {
        window.game.scene.remove(scene)
    }, scene)
}
/** Returns data from a scene. It must be serializable, otherwise it
 * will return  undefined */
export const getData = async (
    page: dsl.Page,
    sceneName: string,
    key: string
) => {
    return await page.evaluate(
        ({ sceneName, key }) => {
            const scene = window.game.scene.getScene(sceneName)

            return scene.data.get(key)
        },
        { sceneName, key }
    )
}

export const currentScreenIs = async (page: dsl.Page, sceneName: string) => {
    const ok = await page.evaluate(
        ({ sceneName }) => {
            return window.game.scene.isActive(sceneName)
        },
        { sceneName }
    )

    if (!ok) throw new Error(`Screen ${sceneName} is not active`)
}
export const startNewGame = async (page: dsl.Page) => {
    await click(1280 / 2, 768 / 2, page)
}

export const click = async (x: number, y: number, page: dsl.Page) => {
    await page.waitForTimeout(300) // equals 200 actions per minute
    page.mouse.click(x, y)
}

export const dragAndDrop = async (
    from: { x: number; y: number },
    to: { x: number; y: number },
    page: dsl.Page
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
    page: dsl.Page,
    scene: string,
    label: string
) {
    const clicked = await page.evaluate(
        ({ scene, label }) => {
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
            `Button with label "${label}" on scene "${scene}" couldn't be clicked.`
        )
}

export async function sceneHasChild(
    page: dsl.Page,
    scene: string,
    name: string,
    shouldExist: boolean
) {
    const exists = await page.evaluate(
        ({ scene, name }) => {
            const element = window.game.scene
                .getScene(scene)
                .children.getByName(name)

            return Boolean(element)
        },
        { scene, name }
    )

    if (shouldExist && !exists)
        throw new Error(
            `Element with name "${name}" on scene "${scene}" should exist.`
        )
    else if (!shouldExist && exists)
        throw new Error(
            `Element with name "${name}" on scene "${scene}" shouldn't exist.`
        )
}

export async function buttonIsRendered(
    page: dsl.Page,
    scene: string,
    label: string
) {
    const ok = await page.evaluate(
        ({ scene, label }) => {
            //@ts-ignore
            const btn: Phaser.GameObjects.Container = window.game.scene
                .getScene(scene)
                .children.list.find((child) => {
                    if (child.name === label) return child
                    //@ts-ignore
                    else if (child.children) {
                        //@ts-ignore
                        return child.children.getByName(label)
                    } else return false
                })

            if (!btn) return false

            const { x, y } = btn.getBounds()

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
            `Button with label "${label}" not rendered on scene "${scene}"`
        )
}

export async function textIsVisible(
    page: dsl.Page,
    scene: string,
    label: string
) {
    const isVisible = await page.evaluate(
        ({ scene, label }) => {
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
            `Text with label "${label}" on scene "${scene}" is not present.`
        )
}
export async function textIsNotVisible(
    page: dsl.Page,
    scene: string,
    label: string
) {
    const isVisible = await page.evaluate(
        ({ scene, label }) => {
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

    if (isVisible)
        throw new Error(
            `Text with label ${label} on scene ${scene} is present.`
        )
}
export async function waitForSceneCreation(page: dsl.Page, screen: string) {
    await page.evaluate(
        ({ screen }) => {
            return new Promise<void>((resolve) => {
                window.game.events.once(`${screen} Created`, () => {
                    resolve()
                })
            })
        },
        { screen }
    )
}

export async function setGameData(page: dsl.Page, key: string, data: any) {
    await page.evaluate(
        ({ data }) => {
            window.game.registry.set(key, data)
        },
        { data }
    )
}
