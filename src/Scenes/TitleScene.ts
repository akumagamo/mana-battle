import Phaser from "phaser";
import { getOptions } from "../DB";
import { preload } from "../preload";
import button from "../UI/button";
import { SCREEN_WIDTH, SCREEN_HEIGHT } from "../constants";
import { Chara, loadCharaAssets } from "../Chara/Chara";
import { Container } from "../Models";
import { fadeOut } from "../UI/Transition";
import { makeUnit } from "../Unit/makeUnit";
import { storyManager } from "./storyManager";

export default class TitleScene extends Phaser.Scene {
  music: Phaser.Sound.BaseSound | null = null;
  charas: Chara[] = [];
  container: Container | null = null;
  constructor() {
    super("TitleScene");
  }
  preload() {
    preload.bind(this)();
    loadCharaAssets(this);
  }

  create() {
    this.events.once("shutdown", () => this.turnOff());

    this.container = this.add.container(0, 0);
    const bg = this.add.image(0, 0, "backgrounds/sunset");
    bg.setOrigin(0, 0);
    bg.displayWidth = SCREEN_WIDTH;
    bg.displayHeight = SCREEN_HEIGHT;
    this.container.add(bg);

    this.charas = [
      new Chara(
        "3",
        this,
        makeUnit("fighter", 3, 1),
        250,
        500,
        1.3,
        false,
        true
      ),
      new Chara("1", this, makeUnit("mage", 1, 1), 350, 520, 1.5, false, true),
      new Chara(
        "2",
        this,
        makeUnit("archer", 2, 1),
        450,
        550,
        1.6,
        false,
        true
      ),
    ];

    this.charas.forEach((c) => {
      c.container.scaleX = c.container.scaleX * -1;
    });
    this.charas.forEach((c) => this.container?.add(c.container));

    this.changeMusic("title");

    button(20, 650, "Go Fullscreen", this.container, this, () => {
      window.document.body.requestFullscreen();
    });

    button(
      SCREEN_WIDTH / 2,
      550,
      "New Game",
      this.container,
      this,
      async () => {
        await storyManager(this);
      }
    );

    button(SCREEN_WIDTH / 2, 620, "Options", this.container, this, () => {
      this.scene.transition({
        target: "OptionsScene",
        duration: 0,
        moveBelow: true,
      });
    });
  }

  private changeMusic(key: string) {
    if (this.music) this.music.destroy();

    if (getOptions().musicEnabled) {
      this.music = this.sound.add(key);
      this.music.play();
    }
  }

  async mapsEvent() {
    await fadeOut(this);
    this.scene.start("MapListScene");
  }

  turnOff() {
    this.charas.map((c) => c.container.destroy());
    this.charas.map((c) => this.scene.remove(c));
    this.charas = [];
    this.container?.destroy();
  }
}
