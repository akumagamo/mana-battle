import { Unit } from "../../Unit/Model";
import findTileByXY from "../findTileByXY";
import highlightTile from "../highlightTile";
import { Board } from "../Model";

export default (board: Board) => (_unit: Unit, x: number, y: number) => {
  const tile = findTileByXY(board, x, y);

  if (tile) {
    highlightTile(board, tile);
  }
};
