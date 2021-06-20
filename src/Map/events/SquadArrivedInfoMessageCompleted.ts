import { Chara } from "../../Chara/Model";
import { createEvent } from "../../utils";

export default (scene: Phaser.Scene) =>
  createEvent<Chara>(scene.events, "SquadArrivedInfoMessageCompleted");
