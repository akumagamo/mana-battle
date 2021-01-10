import { Map } from "immutable";
import plains from "../Backgrounds/plains";
import { Chara } from "../Chara/Chara";
import { Container } from "../Models";
import { preload } from "../preload";
import { createUnit, CreateUnitCmd } from "./cmds/createUnit";
import { speak, SpeakCmd } from "./cmds/speak";
import { wait, WaitCmd } from "./cmds/wait";

type TheaterBackground = "plains" | "woods";

interface TheaterSceneConfig {
  background: TheaterBackground;
  steps: TheaterCmd[];
}

type TheaterCmd = CreateUnitCmd | WaitCmd | SpeakCmd;

export const startTheaterScene = (
  parent: Phaser.Scene,
  config: TheaterSceneConfig
) => {
  parent.scene.start("TheaterScene", config);
};

export default class TheaterScene extends Phaser.Scene {
  constructor() {
    super("TheaterScene");
  }
  preload = preload;
  charas: Map<string, Chara> = Map();

  container: Container | null = null;

  create(data: TheaterSceneConfig) {
    this.container = this.add.container();

    this.renderBackground(data.background);
    this.playScript(data.steps);
  }

  async playScript(steps: TheaterCmd[]) {
    return await steps.reduce(async (prev, step) => {
      await prev;
      switch (step.type) {
        case "CREATE_UNIT":
          return createUnit(this, step);
        case "WAIT":
          return wait(this, step);
        case "SPEAK":
          return speak(this, step);
        default:
          return;
      }
    }, Promise.resolve());
  }

  charaKey(id: string): string {
    return `theater_${id}`;
  }

  renderBackground(bg: TheaterBackground) {
    switch (bg) {
      case "plains":
        return plains(this, this.container);

      case "woods":
        return plains(this, this.container);

      default:
        return plains(this, this.container);
    }
  }
}
