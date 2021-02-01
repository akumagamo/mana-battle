import { SCREEN_HEIGHT, SCREEN_WIDTH } from "./constants";

export function progressBar(scene: Phaser.Scene) {
  const width = 400;
  const height = 50;
  const x = SCREEN_WIDTH / 2 - width / 2;
  const y = SCREEN_HEIGHT / 2;
  const padding = 10;
  let progressBar = scene.add.graphics();
  let progressBox = scene.add.graphics();
  progressBox.fillStyle(0x222222, 0.8);
  progressBox.fillRect(x, y, width, height);

  scene.load.on("progress", (value: number) => {
    progressBar.clear();
    progressBar.fillStyle(0xffffff, 1);
    progressBar.fillRect(
      x + padding,
      y + padding,
      width * value - padding * 2,
      height - padding * 2
    );
  });

  scene.load.on("fileprogress", (file: Phaser.Loader.File) => {
    console.log(file.src);
  });
  scene.load.on("complete", function () {
    console.log("complete!");
    progressBar.destroy();
    progressBox.destroy();
  });
}
