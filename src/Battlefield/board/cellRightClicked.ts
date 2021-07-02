import { MapState, Vector } from "../Model";
import { issueSquadMoveOrder } from "./issueSquadMoveOrder";

export default function cellRightClicked({
  scene,
  state,
  tile,
  pointer,
}: {
  scene: Phaser.Scene;
  state: MapState;
  tile: Vector;
  pointer: Vector;
}) {
  if (state.uiMode.type === "SQUAD_SELECTED")
    issueSquadMoveOrder(scene, state, tile, state.uiMode.id);
}
