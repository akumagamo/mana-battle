import { Vector } from "matter";
import { createEvent } from "../../utils";
import { MapState } from "../Model";
import signal from "../signal";
import { pingEffect } from "./pingEffect";

export const key = "CellClicked";

export async function handleCellClick({
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
  if (!state.cellClickDisabled)
    signal(scene, state, "regular click cell", [
      { type: "CLICK_CELL", cell: tile },
    ]);

  pingEffect(scene, pointer);
}

export default (scene: Phaser.Scene) =>
  createEvent<{
    scene: Phaser.Scene;
    state: MapState;
    tile: Vector;
    pointer: Vector;
  }>(scene.events, key);
