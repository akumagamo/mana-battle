import { Board } from "./Model"

export default (board: Board) => {
    board.container.sort("y")
    const cells_ = board.container.getByName("tileContainer")
    board.container.sendToBack(cells_)
}
