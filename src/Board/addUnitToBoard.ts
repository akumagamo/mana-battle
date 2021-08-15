import createChara from "../Chara/createChara"
import { Chara } from "../Chara/Model"
import { getMember } from "../Squad/Model"
import { Unit } from "../Unit/Model"
import getUnitPositionOnScreen from "./getUnitPositionOnScreen"
import { Board } from "./Model"

export default (board: Board, unit: Unit): Chara => {
    const member = getMember(unit.id, board.squad)

    const { x, y } = getUnitPositionOnScreen(member)

    const chara = createChara({
        scene: board.scene,
        unit,
        x: x * board.scale,
        y: y * board.scale,
        scale: board.scale * 2,
        animated: false,
        showHpBar: true,
    })

    board.container.add(chara.container)

    if (chara.unit.currentHp < 1) chara.tint(222222)

    return chara
}
