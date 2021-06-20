import { createEvent } from "../../utils";

export default (scene: Phaser.Scene) =>
  createEvent<string>(scene.events, "SquadDispatched");
