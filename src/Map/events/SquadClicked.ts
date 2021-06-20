import { createEvent } from "../../utils";
import { MapSquad } from "../Model";

export default (scene: Phaser.Scene) =>
  createEvent<MapSquad>(scene.events, "SquadClicked");
