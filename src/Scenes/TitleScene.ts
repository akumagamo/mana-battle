import Phaser from "phaser";
import { getSquads, getOptions, getUnits, disbandSquad } from "../DB";
import defaultData from "../defaultData";
import { preload } from "../preload";
import button from "../UI/button";
import {
  SCREEN_WIDTH,
  SCREEN_HEIGHT,
  lipsum,
  SCENES,
  PUBLIC_URL,
} from "../constants";
import { Chara, loadCharaAssets } from "../Chara/Chara";
import { Container } from "../Models";
import { fadeIn, fadeOut } from "../UI/Transition";
import { Set } from "immutable";
import { startTheaterScene } from "../Theater/TheaterScene";
import CharaCreationScene, {
  startCharaCreationScene,
} from "../CharaCreation/CharaCreationScene";
import chapter_1_intro from "../Theater/Chapters/chapter_1_intro";
import { makeUnit } from "../Unit/makeUnit";

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

  turnOff() {
    this.charas.map((c) => c.container.destroy());
    this.charas.map((c) => this.scene.remove(c));
    this.charas = [];
    this.container?.destroy();
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

    this.charas.map((c) => {
      c.charaWrapper.scaleX = c.charaWrapper.scaleX * -1;
    });
    this.charas.map((c) => this.container?.add(c.container));

    this.changeMusic("title");

    button(20, 50, "List Units", this.container, this, () => {
      this.scene.transition({
        target: "ListUnitsScene",
        duration: 0,
        moveBelow: true,
      });
    });

    button(20, 170, "List Squads", this.container, this, () => {
      this.scene.start("ListSquadsScene", {
        units: Object.values(getUnits()),
        squads: Object.values(getSquads()),
        dispatched: Set(),
        onDisbandSquad: (id: string) => disbandSquad(id),
      });
    });

    //     button(20, 370, "Create Character", this.container, this, () => {
    //       startCharaCreationScene(this, null);
    //     });

    button(20, 230, "Maps", this.container, this, () => this.mapsEvent());

    // button(20, 290, "Combat", this.container, this, () => {
    //   this.scene.start("CombatScene", {
    //     top: "1",
    //     bottom: "2",
    //     squads: [getSquad("1"), getSquad("2")],
    //     units: [getUnit("1"), getUnit("2")],
    //     onCombatFinish: () => {
    //       this.scene.start("TitleScene");
    //     },
    //   });
    // });
    button(20, 290, "Theater test", this.container, this, () => {
      startTheaterScene(this, {
        background: "plains",
        steps: [
          {
            type: "CREATE_UNIT",
            unit: Object.values(getUnits())[0],
            x: 100,
            y: 100,
            front: true,
            pose: "stand",
            showWeapon: false,
          },
          { type: "WAIT", duration: 500 },
          {
            type: "CREATE_UNIT",
            unit: Object.values(getUnits())[2],
            x: 200,
            y: 200,
            front: true,
            pose: "stand",
            showWeapon: true,
          },
          { type: "WAIT", duration: 500 },
          {
            type: "SPEAK",
            id: Object.values(getUnits())[2].id,
            text: lipsum,
          },
          { type: "WAIT", duration: 500 },
          {
            type: "CREATE_UNIT",
            unit: Object.values(getUnits())[3],
            x: 300,
            y: 300,
            front: true,
            pose: "stand",
            showWeapon: true,
          },
          {
            type: "WALK",
            id: Object.values(getUnits())[0].id,
            x: 600,
            y: 600,
          },
        ],
      });
    });

    button(20, 650, "Erase Data", this.container, this, () => {
      defaultData(true);
      alert("Data erased!");
    });

    button(220, 650, "Go Fullscreen", this.container, this, () => {
      window.document.body.requestFullscreen();
    });

    button(
      SCREEN_WIDTH / 2,
      550,
      "New Game",
      this.container,
      this,
      async () => {
        this.tweens.add({
          targets: this.music,
          volume: 0,
          duration: 1000,
        });
        await fadeOut(this);

        this.container.destroy();
        const scene = await startCharaCreationScene(this);

        const unit = await scene.createUnitForm();
        console.log(`the unit`, unit);
        const answers = await startTheaterScene(this, chapter_1_intro(unit));
        console.log(`>>>`, answers);
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
}
