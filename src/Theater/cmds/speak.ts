import { Chara } from "../../Chara/Chara";
import { SCREEN_HEIGHT, SCREEN_WIDTH } from "../../constants";
import { animatedText } from "../../UI/animatedText";
import panel from "../../UI/panel";
import text from "../../UI/text";
import TheaterScene from "../TheaterScene";

export type Speak = {
  type: "SPEAK";
  id: string;
  text: string;
};

export const speak = (scene: TheaterScene, { id, text: text_ }: Speak, speed:number) => {
  const chara = scene.charas.get(scene.charaKey(id));

  const PANEL_HEIGHT = 200;
  const y = SCREEN_HEIGHT - PANEL_HEIGHT;
  const container = scene.add.container(0, y);

  panel(0, 0, SCREEN_WIDTH, PANEL_HEIGHT, container, scene);

  const head = new Chara({
    key: "head",
    parent: scene,
    unit: chara.props.unit,
    cx: 100,
    cy: 120,
    scaleSizing: 1.4,
    headOnly: true,
  });

  container.add(head.container);

  text(190, 20, chara.props.unit.name, container, scene);
  const unitText = text(190, 60, "", container, scene);

  const clickZone = scene.add.zone(0, y, SCREEN_WIDTH, PANEL_HEIGHT);
  clickZone.setInteractive();
  clickZone.setOrigin(0);

  return new Promise<void>(async (resolve) => {
    await animatedText(scene, text_, unitText, speed);

    const img = scene.add.image(SCREEN_WIDTH - 100, 100, "arrow_right");
    container.add(img);
    scene.tweens.add({
      targets: img,
      y: 80,
      duration: 2000,
      yoyo: true,
      ease: "Cubic",
      repeat: -1,
    });

    clickZone.on("pointerdown", () => {
      container.destroy();
      scene.scene.remove("head");
      resolve();
    });
  });
};
