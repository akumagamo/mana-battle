import { delay } from "../../Scenes/utils";
import TheaterScene from "../TheaterScene";

export type Wait= {
  type: "WAIT";
  duration: number;
};

export const wait = (scene: TheaterScene, cmd: Wait) =>
  delay(scene, cmd.duration);
