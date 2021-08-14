import { isPointerInTile } from "./isPointerInTile"
import { Board } from "./Model"

export default (board: Board, x: number, y: number) => {
    return board.tiles.find(isPointerInTile({ x, y: y }))
}
