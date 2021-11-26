import dsl from "puppeteer"
import Phaser from "phaser"

declare global {
    interface Window {
        game: Phaser.Game
    }
}

const port = process.env.CI ? 3333 : 3000

export async function openGame() {
    const url = `http://localhost:${port}`
    console.log(`Opening ${url}`)
    console.time(`Page is ready for testing`)

    await page.goto(url)
    await waitForSceneCreation("Core Screen")

    console.timeEnd(`Page is ready for testing`)
}

export async function removeScene(scene: string) {
    await page.evaluate((scene) => {
        window.game.scene.remove(scene)
    }, scene)
}

export const drag = async ([x, y]: number[], [x_, y_]: number[]) => {
    await page.mouse.move(x, y)

    await page.mouse.down()

    await page.mouse.move(x_, y_)

    await page.mouse.up()
}

/**
 * @TODO: replace with `click`?
 */
export async function clickButton(
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

export async function buttonIsRendered(
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

/**
 * @TODO: make visible/not visible a parameter
 */
export async function textIsNotVisible(
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
/**
 * @TODO: refactor this as 'waitForGameEvent'
 */
export async function waitForSceneCreation(screen: string) {
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

export const getPositonOf = (scene: string) => async (id: string) =>
    page.evaluate(
        ({ id, scene }: { id: string; scene: string }) => {
            const sprite = window.game.scene
                .getScene(scene)
                .children.getByName(id) as Phaser.GameObjects.Sprite

            const { canvas } = window.game
            const camera = window.game.scene.getScene(scene).cameras.main

            const scaleX = 1 / window.game.scale.displayScale.x
            const scaleY = 1 / window.game.scale.displayScale.y
            
            const x =
                scaleX * sprite.x + canvas.offsetLeft - scaleX * camera.scrollX
            const y =
                scaleY * sprite.y + canvas.offsetTop - scaleY * camera.scrollY

            return {
                x,
                y,
            }
        },
        { id, scene }
    )

/**
 * Attempts to click in an object that is a direct child of a scene.
 * @TODO: make this throw an error if the object position is outside the screen
 */
export const click = (scene: string) => (id: string) => async () => {
    const { x, y } = await getPositonOf(scene)(id)
    await page.mouse.click(x, y)
}
