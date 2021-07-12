import { Container } from "../../Models";
import { createEvent } from "../../utils";

export const key = "SquadArrivedInfoMessageCompleted";

export default (scene: Phaser.Scene) =>
  createEvent<Container>(scene.events, key);
