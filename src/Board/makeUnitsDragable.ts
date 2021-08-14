import onEnableDrag from "../Chara/events/onEnableDrag"
import { Chara } from "../Chara/Model"
import { SquadRecord } from "../Squad/Model"
import { Unit } from "../Unit/Model"
import changeUnitPositionInBoard from "./changeUnitPositionInBoard"
import onUnitDrag from "./events/onUnitDrag"
import { Board } from "./Model"

export default (
    board: Board,
    onSquadUpdated: (
        squad: SquadRecord,
        added: string[],
        removed: string[]
    ) => void,
    onDragStart?: (unit: Unit, x: number, y: number, chara: Chara) => void,
    onDragEnd?: (chara: Chara) => (x: number, y: number) => void
) => {
    board.unitList.forEach(chara => {
        makeUnitDragable(chara, board, onDragStart, onDragEnd, onSquadUpdated)
    })
}
export function makeUnitDragable(
    chara: Chara,
    board: Board,
    onDragStart?: (unit: Unit, x: number, y: number, chara: Chara) => void,
    onDragEnd?: (chara: Chara) => (x: number, y: number) => void,
    onSquadUpdated?: (
        squad: SquadRecord,
        added: string[],
        removed: string[]
    ) => void
) {
    onEnableDrag(
        chara,
        (u, x, y, chara) => {
            if (onDragStart) {
                onDragStart(u, x, y, chara)
                onUnitDrag(board)(u, x, y)
            }
        },
        c => (x, y) => {
            if (onDragEnd && onSquadUpdated) {
                changeUnitPositionInBoard(
                    board,
                    { unit: c.unit, x, y },
                    onSquadUpdated
                )

                onDragEnd(c)(x, y)
            }
        }
    )
}
