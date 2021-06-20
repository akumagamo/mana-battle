import { Chara } from "../../Chara/Model";
import { createEvent } from "../../utils";

export const key = "CloseSquadArrivedInfoMessage";

export default (scene: Phaser.Scene) =>
  createEvent<Chara>(scene.events, key);
