import { createEvent } from "../../utils";
import { MapScene } from "../MapScene";
import { MapSquad } from "../Model";

export const key = "MovePlayerSquadButonClicked";
export default (scene: Phaser.Scene) =>
  createEvent<{
    mapScene: MapScene;
    mapSquad: MapSquad;
  }>(scene.events, key);
