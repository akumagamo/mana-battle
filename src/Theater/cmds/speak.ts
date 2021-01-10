import { Chara } from "../../Chara/Chara";
import { SCREEN_HEIGHT, SCREEN_WIDTH } from "../../constants";
import { animatedText } from "../../UI/animatedText";
import panel from "../../UI/panel";
import text from "../../UI/text";
import TheaterScene from "../TheaterScene";

export type SpeakCmd = {
  type: "SPEAK";
  id: string;
  text: string;
};

export const speak = (scene: TheaterScene, { id, text: text_ }: SpeakCmd) => {
  const chara = scene.charas.get(scene.charaKey(id));

  const PANEL_HEIGHT = 200;
  const y = SCREEN_HEIGHT - PANEL_HEIGHT;
  const container = scene.add.container(0, y);

  panel(0, 0, SCREEN_WIDTH, PANEL_HEIGHT, container, scene);

  const head = new Chara(
    "head",
    scene,
    chara.unit,
    100,
    120,
    1.4,
    true,
    false,
    true
  );

  container.add(head.container);

  text(190, 20, chara.unit.name, container, scene);
  const unitText = text(190, 60, "", container, scene);

  const clickZone = scene.add.zone(0, y, SCREEN_WIDTH, PANEL_HEIGHT);
  clickZone.setInteractive();
  clickZone.setOrigin(0);

  return new Promise<void>(async (resolve) => {
    await animatedText(scene, text_, unitText);

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
