import { MapState, Vector } from "../Model";
import selectCell from "./selectCell";
import { issueSquadMoveOrder } from "./issueSquadMoveOrder";

export default async (scene: Phaser.Scene, state: MapState, cell: Vector) => {
  switch (state.uiMode.type) {
    case "SELECT_SQUAD_MOVE_TARGET":
      await issueSquadMoveOrder(scene, state, cell, state.uiMode.id);
      break;
    default:
      selectCell(scene, state, cell);
  }
};
