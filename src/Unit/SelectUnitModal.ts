import createChara from "../Chara/createChara"
import { SCREEN_WIDTH, SCREEN_HEIGHT } from "../constants"
import { Container } from "../Models"
import button from "../UI/button"
import panel from "../UI/panel"
import { UnitIndex, Unit } from "./Model"

export default function(
    scene: Phaser.Scene,
    units: UnitIndex,
    OnUnitChosen: (s: Unit) => void,
    onClose: () => void
) {
    const container = scene.add.container()
    panel(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT, container, scene)
    let details: Container | null = null

    units.toList().forEach((unit, iter) => {
        createChara({
            scene: scene,
            x: 50,
            y: 100 + 100 * iter,
            scale: 0.4,
            unit,
        })
    })

    button(1100, 300, "Close", container, scene, () => {
        container.destroy()
        onClose()
    })
}
