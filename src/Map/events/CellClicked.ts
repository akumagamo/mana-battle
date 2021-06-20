import { Vector } from "matter";
import { createEvent } from "../../utils";

export const key = "CellClicked";

export default (scene: Phaser.Scene) =>
  createEvent<{ tile: Vector; pointer: Vector }>(scene.events, key);
