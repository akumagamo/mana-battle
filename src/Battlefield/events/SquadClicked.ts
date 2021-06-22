import { createEvent } from "../../utils";
import { MapSquad } from "../Model";

export const key = "SquadClicked";

export default (scene: Phaser.Scene) =>
  createEvent<MapSquad>(scene.events, key);
