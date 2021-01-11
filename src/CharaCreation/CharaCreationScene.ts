import { SKIN_COLORS, HAIR_COLORS } from "../Chara/animations/constants";
import { Chara } from "../Chara/Chara";
import { SCENES, SCREEN_HEIGHT, SCREEN_WIDTH } from "../constants";
import { Container } from "../Models";
import { preload } from "../preload";
import button from "../UI/button";
import panel from "../UI/panel";
import text from "../UI/text";
import { makeUnit } from "../Unit/Jobs";
import { HAIR_STYLES, Unit, UnitClass, unitClassLabels } from "../Unit/Model";

const { CHARA_CREATION_SCENE } = SCENES;

interface CharaCreationSceneConfig {}

type SceneCommands = null;

export const startCharaCreationScene = (
  parent: Phaser.Scene,
  config: CharaCreationSceneConfig
) => {
  parent.scene.start(CHARA_CREATION_SCENE, config);
};

export default class CharaCreationScene extends Phaser.Scene {
  constructor() {
    super(CHARA_CREATION_SCENE);
  }
  preload = preload;

  unit: Unit | null = null;
  chara: Chara | null = null;
  container: Container | null = null;

  create(_data: SceneCommands) {
    const bg = this.add.image(0, 0, "map_select");
    bg.setOrigin(0);
    bg.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
    this.container = this.add.container();

    this.unit = {
      ...makeUnit("fighter", "new_chara", 1),
      style: {
        skinColor: SKIN_COLORS[0],
        hairColor: HAIR_COLORS[0],
        hair: HAIR_STYLES[0],
        displayHat: false,
      },
    };

    this.refreshChara();

    const BTN_MARGIN = 10;
    const BTN_SIZE = 50;
    const baseX = 500;

    panel(baseX, 100, 600, 110, this.container, this).setAlpha(0.6);
    text(baseX + 10, 110, "Skin color", this.container, this);
    SKIN_COLORS.forEach((c, i) => {
      const btn = this.add.rectangle(
        baseX + i * (BTN_SIZE + BTN_MARGIN) + 10,
        150,
        BTN_SIZE,
        BTN_SIZE
      );
      btn.setOrigin(0);

      btn.setFillStyle(c, 1);
      btn.setInteractive();
      btn.on("pointerdown", () => {
        this.unit = {
          ...this.unit,
          style: { ...this.unit.style, skinColor: c },
        };
        this.refreshChara();
      });
    });

    panel(baseX, 240, 600, 120, this.container, this).setAlpha(0.6);
    text(baseX + 10, 250, "Hair color", this.container, this);
    HAIR_COLORS.forEach((c, i) => {
      const btn = this.add.rectangle(
        baseX + i * (BTN_SIZE + BTN_MARGIN),
        300,
        BTN_SIZE,
        BTN_SIZE
      );

      btn.setOrigin(0);
      btn.setFillStyle(c, 1);
      btn.setInteractive();
      btn.on("pointerdown", () => {
        this.unit = {
          ...this.unit,
          style: { ...this.unit.style, hairColor: c },
        };
        this.refreshChara();
      });
    });

    panel(baseX, 410, 600, 120, this.container, this).setAlpha(0.6);
    const hairBtnSize = 40;
    text(baseX + 10, 420, "Hair Style", this.container, this);
    HAIR_STYLES.forEach((c, i) => {
      button(
        baseX + i * (hairBtnSize + BTN_MARGIN) + hairBtnSize / 2,
        470,
        (i + 1).toString(),
        this.container,
        this,
        () => {
          this.unit = {
            ...this.unit,
            style: { ...this.unit.style, hair: c },
          };
          this.refreshChara();
        },
        false,
        hairBtnSize
      );
    });

    const classBtnSize = 120;
    const classY = 550;
    panel(baseX, classY, 700, 120, this.container, this).setAlpha(0.6);
    text(baseX + 10, classY + 10, "Class", this.container, this);
    Object.entries(unitClassLabels).forEach(([k, v], i) => {
      button(
        baseX + i * (classBtnSize + BTN_MARGIN) + classBtnSize / 2,
        classY + 60,
        v,
        this.container,
        this,
        () => {
          this.unit = {
            ...this.unit,
            class: k as UnitClass,
          };
          this.refreshChara();
        },
        false,
        classBtnSize
      );
    });
  }
  refreshChara() {
    this.scene.remove("new_chara");
    this.chara = new Chara(
      "new_chara",
      this,
      this.unit,
      250,
      250,
      3,
      true,
      true,
      false,
      false,
      false
    );
  }
}
