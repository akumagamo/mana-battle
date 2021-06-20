import { Map } from "immutable";
import { Container } from "../../Models";
import { createEvent } from "../../utils";
import { MapScene } from "../MapScene";
import { MapSquad } from "../Model";

export default (scene: Phaser.Scene) =>
  createEvent<{
    container: Container;
    scene: MapScene;
    squads: Map<string, MapSquad>;
  }>(scene.events, "DispatchWindowRendered");
