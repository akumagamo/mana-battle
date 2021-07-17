import plains from "../Backgrounds/plains";
import { CharaIndex, emptyIndex } from "../Chara/Model";
import { Container } from "../Models";
import { fadeOut } from "../UI/Transition";
import { createUnit } from "./cmds/createUnit";
import { speak } from "./cmds/speak";
import { wait } from "./cmds/wait";
import { walk } from "./cmds/walk";
import { Answer, question } from "./cmds/question";
import { flipUnit } from "./cmds/flipUnit";
import { Background, Cmd, SceneConfig } from "./Models";
import { PUBLIC_URL } from "../constants";
import { progressBar } from "../progressBar";
import { GAME_SPEED } from "../env";

export const startTheaterScene = async (
  parent: Phaser.Scene,
  config: SceneConfig
) => {
  const scene = new TheaterScene();

  parent.scene.add("TheaterScene", scene, true, config);
};

export default class TheaterScene extends Phaser.Scene {
  constructor() {
    super("TheaterScene");
  }
  preload() {
    progressBar(this);
    [
      "backgrounds/plain",
      "backgrounds/castle",
      "backgrounds/squad_edit",
    ].forEach((str) => this.load.image(str, PUBLIC_URL + "/" + str + ".svg"));
    ["backgrounds/throne_room"].forEach((str) =>
      this.load.image(str, PUBLIC_URL + "/" + str + ".jpg")
    );
    const props = [
      "props/grass",
      "props/bush",
      "props/far_tree_1",
      "props/branch",
    ];
    props.forEach((id: string) => {
      this.load.image(id, `${PUBLIC_URL}/${id}.svg`);
    });
    if (process.env.SOUND_ENABLED) {
      const mp3s = ["jshaw_dream_of_first_flight"];
      mp3s.forEach((id: string) => {
        this.load.audio(id, `${PUBLIC_URL}/music/${id}.mp3`);
      });
    }
  }
  charas: CharaIndex = emptyIndex;

  container: Container | null = null;

  create(data: SceneConfig) {
    this.container = this.add.container();

    this.renderBackground(data.background);
    this.playScript(data.steps);
  }

  async playScript(steps: Cmd[]) {
    return steps.reduce(async (prev, step) => {
      const answers = await prev;
      switch (step.type) {
        case "CREATE_UNIT":
          createUnit(this, step);
          return Promise.resolve(answers);
        case "WAIT":
          await wait(this, step);
          return Promise.resolve(answers);
        case "SPEAK":
          await speak(this, step);
          return Promise.resolve(answers);
        case "WALK":
          await walk(this, step);
          return Promise.resolve(answers);
        case "FINISH":
          await fadeOut(this, 1000 / GAME_SPEED);
          this.charas.forEach((c) => c.destroy());
          this.charas = emptyIndex;
          this.container?.destroy();
          this.scene.remove(this);
          // TODO: create a listener to this event
          this.scene.scene.events.emit("PlayerFinishedAnswering", answers);
          return Promise.resolve(answers)
        case "FLIP":
          flipUnit(this, step);
          return Promise.resolve(answers);
        case "QUESTION":
          const answer = await question(this, step, 1);
          return Promise.resolve(answers.concat([answer]));
        default:
          return Promise.resolve(answers);
      }
    }, Promise.resolve([] as Answer[]));
  }

  charaKey(id: string): string {
    return `theater_${id}`;
  }

  renderBackground(bg: Background) {
    switch (bg) {
      case "plains":
        if (this.container) return plains(this, this.container);

      case "woods":
        if (this.container) return plains(this, this.container);

      case "castle":
        return this.add.image(0, 0, "castlebg").setOrigin(0);

      case "backgrounds/throne_room":
        return this.add.image(0, 0, "backgrounds/throne_room").setOrigin(0);

      default:
        if (this.container) return plains(this, this.container);
    }
  }
}
