import { Map } from "immutable";
import plains from "../Backgrounds/plains";
import { Chara } from "../Chara/Chara";
import { Container } from "../Models";
import { preload } from "../preload";
import { fadeOut } from "../UI/Transition";
import { createUnit, CreateUnitCmd } from "./cmds/createUnit";
import { speak, SpeakCmd } from "./cmds/speak";
import { wait, WaitCmd } from "./cmds/wait";
import { walk, WalkCmd } from "./cmds/walk";

type TheaterBackground = "plains" | "woods" | "castle";

interface TheaterSceneConfig {
  background: TheaterBackground;
  steps: TheaterCmd[];
  resolve?: () => void;
}

type Finish = { type: "FINISH" };

type TheaterCmd = CreateUnitCmd | WaitCmd | SpeakCmd | WalkCmd | Finish;

/**
 * This helps us transform a whole scene into a Promise, by injecting a `resolve`
 * into the scene parameters.
 */
export const startTheaterScene = async (
  parent: Phaser.Scene,
  config: TheaterSceneConfig
) =>
  new Promise<void>((res) => {
    config.resolve = res;

    parent.scene.start("TheaterScene", config);
  });

export default class TheaterScene extends Phaser.Scene {
  constructor() {
    super("TheaterScene");
  }
  preload = preload;
  charas: Map<string, Chara> = Map();

  container: Container | null = null;
  resolve: () => void | null = null;

  create(data: TheaterSceneConfig) {
    this.container = this.add.container();

    this.renderBackground(data.background);
    this.playScript(data.steps, data.resolve);
  }

  async playScript(steps: TheaterCmd[], resolve: () => void) {
    return await steps.reduce(async (prev, step) => {
      await prev;
      switch (step.type) {
        case "CREATE_UNIT":
          return createUnit(this, step);
        case "WAIT":
          return wait(this, step);
        case "SPEAK":
          return speak(this, step);
        case "WALK":
          return walk(this, step);
        case "FINISH":
          await fadeOut(this);
          this.charas.forEach((c) => this.scene.remove(c));
          this.container.destroy();
          return resolve();
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

      case "castle":
        return this.add.image(0, 0, "castlebg").setOrigin(0);

      default:
        return plains(this, this.container);
    }
  }
}
