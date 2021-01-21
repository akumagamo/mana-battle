import { SKIN_COLORS, HAIR_COLORS } from "../Chara/animations/constants";
import { Chara } from "../Chara/Chara";
import { SCENES, SCREEN_HEIGHT, SCREEN_WIDTH } from "../constants";
import { classes, classLabels } from "../defaultData";
import { Container } from "../Models";
import { preload } from "../preload";
import button, { setActive } from "../UI/button";
import panel from "../UI/panel";
import text from "../UI/text";
import { fadeIn } from "../UI/Transition";
import { makeUnit } from "../Unit/Jobs";
import {
  Gender,
  genderLabels,
  genders,
  HAIR_STYLES,
  Unit,
  UnitClass,
  unitClassLabels,
} from "../Unit/Model";

const { CHARA_CREATION_SCENE } = SCENES;

interface CharaCreationSceneConfig {}

type SceneCommands = null;

export const startCharaCreationScene = (
  parent: Phaser.Scene,
  config: CharaCreationSceneConfig
) => {
  parent.scene.start(CHARA_CREATION_SCENE, config);
};

const BTN_MARGIN = 10;
const BTN_SIZE = 40;
const baseX = 500;
const baseY = 50;

const panelWidth = 600;
const panelHeight = 120;

export default class CharaCreationScene extends Phaser.Scene {
  preload = preload;

  unit: Unit | null = null;
  chara: Chara | null = null;
  container: Container | null = null;

  async create(_data: SceneCommands) {
    await fadeIn(this);
  }

  createUnitForm() {
    return new Promise<Unit>(async (resolve) => {
      this.bg();
      this.container = this.add.container();

      const prop = (
        y: number,
        label: string,
        prop: "hair" | "hairColor" | "skinColor",
        index: any[]
      ) =>
        this.propSelector(
          baseX,
          y,
          index.indexOf(this.unit.style[prop]),
          label,
          prop,
          index
        );
      this.initialState();

      this.refreshChara();

      this.nameInput(baseX, baseY);

      this.radio(
        baseX + 300,
        baseY,
        "Gender",
        "gender",
        genders,
        genderLabels,
        300
      );

      prop(baseY + panelHeight, "Skin Color", "skinColor", SKIN_COLORS);
      prop(baseY + panelHeight * 2, "Hair Color", "hairColor", HAIR_COLORS);
      prop(baseY + panelHeight * 3, "Hair Style", "hair", HAIR_STYLES);

      this.radio(
        baseX,
        baseY + panelHeight * 4,
        "Class",
        "class",
        classes,
        classLabels
      );

      this.confirmButton(resolve);
    });
  }
  private confirmButton(resolve: (value: Unit | PromiseLike<Unit>) => void) {
    const img = this.add.image(
      SCREEN_WIDTH - 100,
      SCREEN_HEIGHT - 100,
      "arrow_right"
    );
    this.container.add(img);
    img.setInteractive();
    img.on("pointerdown", () => {
      const name: string = (<HTMLInputElement>(
        document.getElementById("new-chara-name")
      )).value;
      const unit: Unit = { ...this.chara.unit, name };

      this.scene.remove(this.chara);
      this.scene.remove(this);

      resolve(unit);
    });
  }

  private nameInput(x: number, y: number) {
    this.panel(x, y, "Character Name", 300);

    var element = this.add.dom(x + 10, y + 50).createFromCache("nameform");
    element.setPerspective(800);
    element.setOrigin(0);
  }

  private panel(x: number, y: number, label: string, width?: number) {
    const panel_ = panel(
      x,
      y,
      width ? width : panelWidth,
      panelHeight,
      this.container,
      this
    ).setAlpha(0.6);
    text(x + 10, y + 10, label, this.container, this);

    return panel_;
  }

  private bg() {
    const bg = this.add.image(0, 0, "map_select");
    bg.setOrigin(0);
    bg.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
  }

  private initialState() {
    const unit = makeUnit("fighter", "new_chara", 1);
    this.unit = {
      ...unit,
      style: {
        ...unit.style,
        displayHat: false,
      },
    };
  }

  private skinColorInput(x: number, y: number) {
    this.panel(x, y, "Skin Color");

    SKIN_COLORS.forEach(this.onChangeSkingColor(x, y));
  }

  onChangeSkingColor = (x: number, y: number) => async (
    color: number,
    index: number
  ) => {
    const skinColor = await this.colorBtn(x, y, index, color);

    this.unit = {
      ...this.unit,
      style: { ...this.unit.style, skinColor: skinColor },
    };
    this.refreshChara();

    this.onChangeSkingColor(x, y)(color, index);
  };

  private colorBtn(x: number, y: number, i: number, c: number) {
    const btn = this.add.rectangle(
      x + i * (BTN_SIZE + BTN_MARGIN) + 10,
      y + 50,
      BTN_SIZE,
      BTN_SIZE
    );
    btn.setOrigin(0);

    btn.setFillStyle(c, 1);
    btn.setInteractive();
    return new Promise<number>((resolve) => {
      btn.on("pointerdown", async () => {
        resolve(c);
        btn.destroy();
      });
    });
  }

  private classSelector(x: number, y: number) {
    const classBtnSize = 120;
    this.panel(x, y, "Class");
    Object.entries(unitClassLabels).forEach(([k, v], i) => {
      button(
        20 + x + BTN_MARGIN + i * classBtnSize,
        y + 60,
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
  private radio(
    x: number,
    y: number,
    label: string,
    prop: "class" | "gender",
    items: string[],
    labelIndex: { [id: string]: string },
    width?: number
  ) {
    const classBtnSize = 120;

    const renderBtn = (value: string, i: number) => {
      return button(
        20 + x + BTN_MARGIN + i * classBtnSize,
        y + 60,
        labelIndex[value],
        this.container,
        this,
        () => {
          this.unit = {
            ...this.unit,
            [prop]: value,
          };
          elems.map((e) => e.destroy());
          this.radio(x, y, label, prop, items, labelIndex, width);
          this.refreshChara();
        },
        false,
        classBtnSize,
        0,
        value === this.unit[prop]
      );
    };
    const panel_ = this.panel(x, y, label, width);
    const btns = items.map((g, i) => renderBtn(g, i));
    const elems: (Phaser.GameObjects.Graphics | { destroy: () => void })[] = [
      panel_,
      ...btns,
    ];
  }

  private propSelector(
    x: number,
    y: number,
    index: number,
    label: string,
    prop: "hair" | "skinColor" | "hairColor",
    items: string[] | number[]
  ) {
    const panel_ = this.panel(x, y, label);

    const style = text(
      baseX + 100,
      y + 60,
      (index + 1).toString(),
      this.container,
      this
    );

    const prev = button(
      20 + baseX,
      y + 60,
      "<=",
      this.container,
      this,
      () => {
        refresh();
        this.refreshProp(label, index - 1, prop, items, x, y);
      },
      index < 1
    );
    const next = button(
      160 + baseX,
      y + 60,
      "=>",
      this.container,
      this,
      () => {
        refresh();
        this.refreshProp(label, index + 1, prop, items, x, y);
      },
      index >= items.length - 1
    );

    // HAIR_STYLES.forEach((c, i) => {
    //   button(
    //     20 + baseX + BTN_MARGIN + i * hairBtnSize,
    //     y + 60,
    //     (i + 1).toString(),
    //     this.container,
    //     this,
    //     () => {
    //       this.unit = {
    //         ...this.unit,
    //         style: { ...this.unit.style, hair: c },
    //       };
    //       this.refreshChara();
    //     },
    //     false,
    //     hairBtnSize
    //   );
    // });
    function refresh() {
      style.destroy();
      panel_.destroy();
      prev.destroy();
      next.destroy();
    }
  }

  private refreshProp(
    label: string,
    index: number,
    currentProp: "hair" | "skinColor" | "hairColor",
    items: string[] | number[],
    x: number,
    y: number
  ) {
    this.unit = {
      ...this.unit,
      style: {
        ...this.unit.style,
        [currentProp]: items[index],
      },
    };
    this.refreshChara();
    this.propSelector(x, y, index, label, currentProp, items);
  }

  private hairColor(x: number, y: number) {
    this.panel(x, y, "Hair Color");
    HAIR_COLORS.forEach((c, i) => {
      const btn = this.add.rectangle(
        x + i * (BTN_SIZE + BTN_MARGIN),
        y + 50,
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
