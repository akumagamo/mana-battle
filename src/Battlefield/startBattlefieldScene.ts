import { MapState } from "./Model";

export default async (parent: Phaser.Scene, state: MapState) => {
  parent.scene.manager.run("MapScene", state);
};
