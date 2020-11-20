import { Scene } from "phaser";
import { Chara } from "../Chara/Chara";
import { Container } from "../Models";
import { Unit } from "../Unit/Model";
import panel from "./panel";
import text from "./text";

export default (
  unit: Unit,
  x: number,
  y: number,
  text_: string,
  container: Container,
  scene: Scene
) => {
  const bg = panel(x, y, 440, 200, container, scene);

  const portrait = new Chara(
    `speech_${unit.id}`,
    scene,
    unit,
    x + 70,
    y + 70,
    1,
    true,
    false,
    true
  );

  const speechText = text(x + 150, y + 50, "", container, scene);

  scene.time.addEvent({
    repeat: text_.length,
    delay: 25,
    callback: () => {
      speechText.text = text_.slice(0, speechText.text.length + 1);
    },
  });

  return { bg, portrait, speechText };
};
