import { Scene } from "phaser";

export function animatedText(
  scene: Scene,
  text_: string,
  speechText: Phaser.GameObjects.Text,
  speed: number
) {
  const characterRenderInterval = 25 / speed;

  scene.time.addEvent({
    repeat: text_.length,
    delay: 0,
    callback: () => {
      speechText.text = text_.slice(0, speechText.text.length + 1);
    },
  });

  return new Promise<void>((resolve) => {
    scene.time.addEvent({
      repeat: 0,
      delay: text_.length * characterRenderInterval,
      callback: () => {
        resolve();
      },
    });
  });
}
