import { Scene } from "phaser";

export function animatedText(
  scene: Scene,
  text_: string,
  speechText: Phaser.GameObjects.Text,
  speed: number
) {
  scene.time.addEvent({
    repeat: text_.length,
    delay: 25 / speed,
    callback: () => {
      speechText.text = text_.slice(0, speechText.text.length + 1);
    },
  });

  return new Promise<void>((resolve) => {
    scene.time.addEvent({
      repeat: 0,
      delay: text_.length * 25,
      callback: () => {
        resolve();
      },
    });
  });
}
