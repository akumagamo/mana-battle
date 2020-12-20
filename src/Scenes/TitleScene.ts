import Phaser from "phaser";
import { getSquads, getOptions, getUnit, getSquad } from "../DB";
import defaultData from "../defaultData";
import { preload } from "../preload";
import button from "../UI/button";
import { SCREEN_WIDTH, SCREEN_HEIGHT } from "../constants";
import { Chara } from "../Chara/Chara";
import { Container } from "../Models";
import {makeUnit} from "../Unit/Jobs";

export default class TitleScene extends Phaser.Scene {
  music: Phaser.Sound.BaseSound | null = null;
  charas: Chara[] = [];
  container: Container | null = null;
  constructor() {
    super("TitleScene");
  }
  preload = preload;

  turnOff() {
    this.charas.map((c) => c.container.destroy());
    this.charas.map((c) => this.scene.remove(c));
    this.charas = [];
    this.container?.destroy();
  }
  create() {
    this.container = this.add.container(0, 0);
    const bg = this.add.image(0, 0, "backgrounds/sunset");
    bg.setOrigin(0, 0);
    bg.displayWidth = SCREEN_WIDTH;
    bg.displayHeight = SCREEN_HEIGHT;
    this.container.add(bg);

    this.charas = [
      new Chara("3", this, makeUnit('fighter', 3, 1), 250, 500, 1.3, false, true),
      new Chara("1", this, makeUnit('mage', 1, 1), 350, 520, 1.5, false, true),
      new Chara("2", this, makeUnit('archer', 2, 1), 450, 550, 1.6, false, true),
    ];

    this.charas.map((c) => {
      c.container.scaleX = -1.5;
    });
    this.charas.map((c) => this.container?.add(c.container));

    if (!this.music) {
      this.sound.stopAll();

      if (getOptions().musicEnabled) {
        this.music = this.sound.add("title");

        //@ts-ignore TODO: check ts declaration
        this.music.setVolume(0.1);
        this.music.play();
      }
    }

    button(20, 50, "List Units", this.container, this, () => {
      this.turnOff();
      this.scene.transition({
        target: "ListUnitsScene",
        duration: 0,
        moveBelow: true,
      });
    });

    button(20, 110, "Edit Squad 0", this.container, this, () => {
      this.turnOff();
      this.scene.transition({
        target: "EditSquadScene",
        duration: 0,
        moveBelow: true,
        data: { squad: getSquads()[0] },
      });
    });

    button(20, 170, "List Squads", this.container, this, () => {
      this.turnOff();
      this.scene.start("ListSquadsScene");
    });

    button(20, 230, "Maps", this.container, this, () => {
      this.turnOff();
      this.scene.start("MapListScene");
    });

    button(20, 290, "Combat", this.container, this, () => {
      this.turnOff();
      this.scene.start("CombatScene", {
        top: "1",
        bottom: "2",
        squads: [getSquad("1"), getSquad("2")],
        units: [getUnit("1"), getUnit("2")],
        onCombatFinish: () => {
          this.scene.start("TitleScene");
        },
      });
    });

    button(20, 650, "Erase Data", this.container, this, () => {
      defaultData(true);
      alert("Data erased!");
    });

    button(220, 650, "Go Fullscreen", this.container, this, () => {
      window.document.body.requestFullscreen();
    });

    //button(SCREEN_WIDTH / 2, 550, 'New Game', this.container, this, () => {
    //  this.cameras.main.fadeOut(1000, 0, 0, 0);
    //  //this.turnOff();
    //  this.scene.transition({
    //    target: 'WorldScene',
    //    duration: 1000,
    //    moveBelow: true,
    //    remove: true,
    //  });
    //});
    button(SCREEN_WIDTH / 2, 620, "Options", this.container, this, () => {
      this.turnOff();
      this.scene.transition({
        target: "OptionsScene",
        duration: 0,
        moveBelow: true,
      });
    });
  }
}
