import { createEvent } from "../../utils";
import { MapScene } from "../MapScene";

export const key = "OrganizeButtonClicked";

export default (scene: Phaser.Scene) =>
  createEvent<MapScene>(scene.events, key);
