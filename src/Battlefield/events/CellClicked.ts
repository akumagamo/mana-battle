import { Vector } from "matter";
import { createEvent } from "../../utils";
import { MapScene } from "../MapScene";
import signal from "../signal";

export const key = "CellClicked";

export async function handleCellClick({
  scene,
  tile,
  pointer,
}: {
  scene: MapScene;
  tile: Vector;
  pointer: Vector;
}) {
  if (!scene.cellClickDisabled)
    signal(scene, "regular click cell", [{ type: "CLICK_CELL", cell: tile }]);

  //this.pingEffect(pointer);
}

export default (scene: MapScene) =>
  createEvent<{ scene: MapScene; tile: Vector; pointer: Vector }>(
    scene.events,
    key
  );
