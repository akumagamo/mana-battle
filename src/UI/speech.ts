import { Scene } from "phaser";
import { Chara } from "../Chara/Chara";
import { Container } from "../Models";
import { Unit } from "../Unit/Model";
import { animatedText } from "./animatedText";
import panel from "./panel";
import text from "./text";

/**
 * Be careful calling this after MapScene's CLICK_SQUAD, as refreshing
 * the UI container (and having it as parent for this) will throw
 * errors at the Chara and text container levels
 */
export default (
  unit: Unit,
  x: number,
  y: number,
  text_: string,
  container: Container,
  scene: Scene
) => {
  const portrait = new Chara({
    key: `speech_${unit.id}`,
    parent: scene,
    unit,
    cx: x + 70,
    cy: y + 70,
    headOnly: true,
  });

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

  animatedText(scene, text_, speechText);

  return { bg, portrait, speechText };
};
