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

  const finalText = text(0, 0, text_, container, scene);
  const bg = panel(
    x,
    y,
    finalText.width + portrait.head.displayWidth + 40,
    finalText.height + portrait.head.displayHeight / 3 + 40, // the full body size is included here. TODO: separate rendering of head
    container,
    scene
  );
  finalText.destroy();

  text(x + 150, y + 10, unit.name, container, scene);

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
