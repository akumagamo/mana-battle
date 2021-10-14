import { Scene } from "phaser"
import button from "./button"
import text from "./text"
import { SCREEN_WIDTH, SCREEN_HEIGHT } from "../constants"

type Event<A> = {
    key: string
    data: A
}

const confirmModal = <A>(scene: Scene, event: Event<A>) => {
    const container = scene.add.container()

    scene.events.on("CLOSE_CONFIRM_MODAL", () => container.destroy())

    button(160, 110, "Confirm", container, () =>
        scene.events.emit(event.key, event.data)
    )

    button(-150, 110, "Confirm", container, () =>
        scene.events.emit("CLOSE_CONFIRM_MODAL")
    )

    text(0, -120, "Are you sure?", container)
        .setOrigin(0.5)
        .setColor("#000")
        .setFontFamily("sans-serif")
        .setFontSize(36)

    container.setPosition(SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2)
}

export default confirmModal
