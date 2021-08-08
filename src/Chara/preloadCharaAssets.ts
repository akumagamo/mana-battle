import { PUBLIC_URL } from "../constants";

export default (scene: Phaser.Scene) => {
  ["insignea", "chara/selected_chara"].forEach((str) =>
    scene.load.image(str, PUBLIC_URL + "/" + str + ".svg")
  );
};
