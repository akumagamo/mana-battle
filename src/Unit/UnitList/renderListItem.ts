import createChara from "../../Chara/createChara"
import { Unit } from "../Model"
import { getRowPosition } from "./actions/getRowPosition"
import background from "./background"
import { UnitList } from "./Model"

const UNIT_LIST_CHARA_SCALE = 1
export default (unitList: UnitList, unit: Unit, index: number) => {
    const { scene, container } = unitList

    const { x, y } = getRowPosition(container.x, container.y, index)

    const rowContainer = scene.add.container()

    container.add(rowContainer)

    const background_ = background(scene)
    background_.setPosition(x, y)

    const chara = createChara({
        scene: scene,
        unit,
        x,
        y,
        scale: UNIT_LIST_CHARA_SCALE,
    })

    unitList.charas = unitList.charas.push(chara)

    const text = scene.add.text(x + 40, y + 30, unit.name)

    rowContainer.add([background_, text, chara.container])

    return rowContainer
}
