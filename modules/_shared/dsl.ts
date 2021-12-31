import Phaser from "phaser"
import { SquadId } from "../Battlefield/Squad"

declare global {
    interface Window {
        game: Phaser.Game
        getMapScene: () => Phaser.Scene
        getMapSceneUI: () => Phaser.Scene
    }
}

export async function openGame() {
    const port = process.env.CI ? 3333 : 3000
    const url = `http://localhost:${port}`
    console.log(`Opening ${url}`)
    console.time(`Page is ready for testing`)

    await page.goto(url)
    await waitForSceneCreation("Core Screen")()

    console.timeEnd(`Page is ready for testing`)
}

// todo: this should be shared with the game
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
export async function clickButton(scene: string, label: string) {
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

export async function buttonIsRendered(scene: string, label: string) {
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

export async function textIsVisible(scene: string, label: string) {
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

export async function checkVisibility(
    scene: string,
    name: string,
    shouldBeVisible: boolean
) {
    const isVisible = await page.evaluate(
        ({ scene, name }) => {
            const gameObject = window.game.scene
                .getScene(scene)
                .children.getByName(name)
            return Boolean(gameObject)
        },
        { scene, name }
    )

    if (!isVisible && shouldBeVisible)
        throw new Error(
            `Element with name "${name}" on screen "${scene}" doesn't exist.`
        )
    else if (isVisible && !shouldBeVisible)
        throw new Error(
            `Element with name "${name}" on screen "${scene}" should not exist.`
        )
}

/**
 * @TODO: make visible/not visible a parameter
 */
export async function textIsNotVisible(scene: string, label: string) {
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
 * use a single event manager for the whole game
 * (no difference between game and scene events)
 */
export function waitForSceneCreation(screen: string) {
    return async () =>
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
    await page.evaluate(
        ({ id, scene }: { id: string; scene: string }) => {
            const sprite = window.mapScreen().getSprite(id)

            const camera = window.game.scene.getScene(scene).cameras.main

            const x = sprite.x + -camera.scrollX
            const y = sprite.y + -camera.scrollY

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
export const spriteEvent =
    (scene: string) => (id: string, event: string) => async () => {
        page.evaluate(
            ({ id, event }: { id: string; event: string }) => {
                window
                    .mapScreen()
                    .getSprite(id as SquadId)
                    .emit(event)
            },
            { id, scene, event }
        )
    }
export const getForceSquads = async (force: string) => {
    return await page.evaluate((force) => {
        const ids =
            (window
                .mapScreen()
                .getState()
                .forces.get(force)
                ?.dispatchedSquads.keySeq()
                .toJS() as string[]) || ([] as string[])

        console.log(`>>>`, ids)
        return ids
    }, force)
}

export function waitForEvent<A>(scene: string, event: string) {
    return async () => {
        await page.evaluate(
            ({ event, scene }: { event: string; scene: string }) => {
                return new Promise<A>((resolve) => {
                    window.game.scene
                        .getScene(scene)
                        .events.once(event, (payload: A) => {
                            resolve(payload)
                        })
                })
            },
            { event, scene }
        )
    }
}
