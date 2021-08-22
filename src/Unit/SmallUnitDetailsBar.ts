import { Container } from "../Models"
import { Unit } from "./Model"
import text from "../UI/text"
import panel from "../UI/panel"
import { JOBS } from "./Jobs/Jobs"

const key = "SmallUnitDetailsBar"
const colWidth = 130

const row = (container: Container, scene: Phaser.Scene) => (
    x: number,
    y: number,
    strs: (string | number)[]
) =>
    strs.forEach((str, index) => write(container)(x + colWidth * index, y, str))

const write = (container: Container) => (
    x: number,
    y: number,
    str: string | number
) => text(x, y, str, container)

export default function(x: number, y: number, parent: Container, unit: Unit) {
    parent.getByName(key)?.destroy()

    const container = parent.scene.add.container()

    container.setName(key)

    panel(x, y, 5 * colWidth, 50, container)

    unitStats(x, y, container, parent.scene, unit)

    parent.add(container)

    return container
}

function unitStats(
    x: number,
    y: number,
    container: Container,
    scene: Phaser.Scene,
    unit: Unit
) {
    const { name, lvl, exp, currentHp, hp } = unit

    row(container, scene)(x + 10, y + 10, [
        name,
        JOBS[unit.job].name,
        `Lvl ${lvl}`,
        `Exp ${exp}`,
        `${currentHp} / ${hp} HP`,
    ])
}
