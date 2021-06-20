import { createEvent } from "../../utils";
import { MapScene } from "../MapScene";
import { MapSquad } from "../Model";

export default (scene: Phaser.Scene) =>
  createEvent<{
    mapScene: MapScene;
    mapSquad: MapSquad;
  }>(scene.events, "MovePlayerSquadButonClicked");
