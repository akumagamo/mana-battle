import { Chara } from "../../Chara/Chara";
import { SCREEN_HEIGHT, SCREEN_WIDTH } from "../../constants";
import { delay } from "../../Scenes/utils";
import { animatedText } from "../../UI/animatedText";
import button from "../../UI/button";
import panel from "../../UI/panel";
import text from "../../UI/text";
import TheaterScene from "../TheaterScene";

export type Answer = { answer: string; value: number };
export type Question = {
  type: "QUESTION";
  id: string;
  /** Question identifier */
  title: string;
  question: string;
  options: Answer[];
};

export const question = async (
  scene: TheaterScene,
  { id, question, options, title }: Question
) => {
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
    front: true
    }
  );

  container.add(head.container);

  text(190, 20, chara.props.unit.name, container, scene);
  const unitText = text(190, 60, "", container, scene);

  // const clickZone = scene.add.zone(0, y, SCREEN_WIDTH, PANEL_HEIGHT);
  // clickZone.setInteractive();
  // clickZone.setOrigin(0);

  await animatedText(scene, question, unitText);

  await delay(scene, 1000);

  return new Promise<Answer>(async (resolve) => {
    options.forEach(({ answer, value }, index) => {
      const y = -450 + index * 60;

      button(800, y, answer, container, scene, () => {
        container.destroy();
        scene.scene.remove("head");
        resolve({ answer, value });
      });
    });
  });

  //const img = scene.add.image(SCREEN_WIDTH - 100, 100, "arrow_right");
  // container.add(img);
  // scene.tweens.add({
  //   targets: img,
  //   y: 80,
  //   duration: 2000,
  //   yoyo: true,
  //   ease: "Cubic",
  //   repeat: -1,
  // });

  // clickZone.on("pointerdown", () => {
  //   container.destroy();
  //   scene.scene.remove("head");
  //   resolve();
  // });
};
