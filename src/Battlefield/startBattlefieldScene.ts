import { MapCommands } from "./MapCommands";

export default async (parent: Phaser.Scene, cmds: MapCommands[]) => {
  parent.scene.manager.run("MapScene", cmds);
};
