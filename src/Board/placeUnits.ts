import addUnit from "./actions/renderUnit"
import { Board } from "./Model"
import sortUnitsByDepth from "./sortUnitsByDepth"

export default (board: Board) => {
    board.squad.members.keySeq().forEach(addUnit(board))
    sortUnitsByDepth(board)
}
