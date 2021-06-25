import { Map } from "immutable";
import { Container } from "../../Models";
import { createEvent } from "../../utils";
import { MapSquad } from "../Model";

export const key = "DispatchWindowRendered";

export default (scene: Phaser.Scene) =>
  createEvent<{
    container: Container;
    scene: Phaser.Scene;
    squads: Map<string, MapSquad>;
  }>(scene.events, key);
