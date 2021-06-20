import { Vector } from "matter";
import { createEvent } from "../../utils";

export const CellClicked = (scene: Phaser.Scene) =>
  createEvent<{ tile: Vector; pointer: Vector }>(scene.events, "CellClicked");
