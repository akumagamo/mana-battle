import Phaser from "phaser";
import { getSquads, getOptions, getUnits, disbandSquad } from "../DB";
import defaultData from "../defaultData";
import { preload } from "../preload";
import button from "../UI/button";
import { SCREEN_WIDTH, SCREEN_HEIGHT, lipsum, SCENES } from "../constants";
import { Chara } from "../Chara/Chara";
import { Container } from "../Models";
import { makeUnit } from "../Unit/Jobs";
import { fadeIn, fadeOut } from "../UI/Transition";
import { Set } from "immutable";
import { startTheaterScene } from "../Theater/TheaterScene";
import CharaCreationScene, {
  startCharaCreationScene,
} from "../CharaCreation/CharaCreationScene";

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
    this.events.once("shutdown", () => this.turnOff());

    //@ts-ignore
    window.title = this;

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

    button(20, 370, "Create Character", this.container, this, () => {
      startCharaCreationScene(this, null);
    });

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
        await fadeOut(this);
        const scene = new CharaCreationScene({});
        this.scene.add(SCENES.CHARA_CREATION_SCENE, scene, true);
        const unit = await scene.createUnitForm();
        startTheaterScene(this, {
          background: "plains",
          steps: [
            {
              type: "CREATE_UNIT",
              unit,
              x: 100,
              y: 100,
              front: true,
              pose: "stand",
              showWeapon: false,
            },
            { type: "WAIT", duration: 500 },
            {
              type: "SPEAK",
              id: unit.id,
              text: lipsum,
            },
            {
              type: "WALK",
              id: unit.id,
              x: 600,
              y: 600,
            },
          ],
        });
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

  async mapsEvent() {
    await fadeOut(this);
    this.scene.start("MapListScene");
  }
}
