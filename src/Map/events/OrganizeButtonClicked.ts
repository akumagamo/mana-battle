import { createEvent } from "../../utils";
import { MapScene } from "../MapScene";

export default (scene: Phaser.Scene) =>
  createEvent<MapScene>(scene.events, "OrganizeButtonClicked");
