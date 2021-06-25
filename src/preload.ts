import preloadCharaAssets from "./Chara/preloadCharaAssets";
import { PUBLIC_URL } from "./constants";
import { progressBar } from "./progressBar";

export function preload(this: Phaser.Scene) {
  ["backgrounds/sunset", "tile"].forEach((str) =>
    this.load.image(str, PUBLIC_URL + "/" + str + ".svg")
  );
  const ui = [
    "arrow_right",
    "panel",
    "announcement_bg",
    "button_move",
    "button_attack",
    "close_btn",
    "ping",
  ];
  ui.forEach((id: string) => {
    this.load.image(id, `${PUBLIC_URL}/ui/${id}.svg`);
  });

  const itemIcons = [
    "amulet",
    "iron_armor",
    "iron_shield",
    "iron_sword",
    "steel_armor",
    "steel_shield",
    "steel_sword",
    "leather_armor",
    "baldar_armor",
    "baldar_shield",
    "baldar_sword",
    "oaken_staff",
    "iron_spear",
    "bow",
    "robe",
  ];

  itemIcons.forEach((id: string) => {
    this.load.image(id, `${PUBLIC_URL}/items/${id}.png`);
  });

  if (process.env.SOUND_ENABLED) {
    const mp3s = ["title"];
    mp3s.forEach((id: string) => {
      this.load.audio(id, `${PUBLIC_URL}/music/${id}.mp3`);
    });
    const oggs = ["click1"];
    oggs.forEach((id: string) => {
      this.load.audio(id, `${PUBLIC_URL}/music/${id}.ogg`);
    });
  }

  this.load.image("map_select", `${PUBLIC_URL}/scenes/map_select.jpg`);

  this.load.html("nameform", "assets/chara-creation/input.html");

  preloadCharaAssets(this);

  progressBar(this);
}
