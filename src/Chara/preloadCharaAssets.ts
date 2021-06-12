import { PUBLIC_URL } from "../constants";
import { classes } from "../Unit/Jobs";

export default (scene: Phaser.Scene) => {
  [
    "insignea",
    "hand",
    "foot",
    "head",
    "chara/head_male",
    "chara/head_female",
  ].forEach((str) => scene.load.image(str, PUBLIC_URL + "/" + str + ".svg"));
  const hairs = [
    "dark1",
    "long1",
    "long2",
    "split",
    "split2",
    "male1",
    "female1",
    "female2",
  ];
  hairs.forEach((str) => {
    scene.load.image(str, PUBLIC_URL + "/hair/" + str + ".svg");
    scene.load.image("back_" + str, PUBLIC_URL + "/hair/back_" + str + ".svg");
  });

  scene.load.image("head", PUBLIC_URL + "/head.svg");
  scene.load.image("back_head", PUBLIC_URL + "/back_head.svg");

  classes.forEach((job) => {
    scene.load.image(`trunk_${job}`, `${PUBLIC_URL}/trunk_${job}.svg`);
    scene.load.image(
      `trunk_back_${job}`,
      `${PUBLIC_URL}/trunk_back_${job}.svg`
    );
  });
  const equips = [
    "equips/iron_sword",
    "equips/iron_spear",
    "equips/steel_sword",
    "equips/baldar_sword",
    "equips/oaken_staff",
    "equips/bow",

    "equips/simple_helm",
    "equips/iron_helm",
    "equips/wiz_hat",
    "equips/archer_hat",

    "equips/back_simple_helm",
    "equips/back_iron_helm",
    "equips/back_wiz_hat",
    "equips/back_archer_hat",
  ];
  equips.forEach((id: string) => {
    scene.load.image(id, `${PUBLIC_URL}/${id}.svg`);
  });
};
