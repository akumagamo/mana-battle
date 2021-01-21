import { classes } from "./defaultData";

const PUBLIC_URL = "assets";

export function preload(this: {
  load: {
    image: (key: string, path: string) => void;
    audio: (key: string, path: string) => void;
    html: (key: string, path: string) => void;
  };
  preload: () => void;
  create: (this: { preload: () => void; create: () => void }) => void;
}) {
  [
    "insignea",
    "tile",
    "hand",
    "foot",
    "head",
    "arrow",
    "backgrounds/plain",
    "backgrounds/sunset",
    "backgrounds/squad_edit",
    "chara/head_male",
    "chara/head_female",
    "hair/female/1"
  ].forEach((str) => this.load.image(str, PUBLIC_URL + "/" + str + ".svg"));

  // @ts-ignore
  this.load.spritesheet("fire", `${PUBLIC_URL}/fire.svg`, {
    frameWidth: 50,
    frameHeight: 117,
    endFrame: 7,
  });

  const hairs = ["dark1", "long1", "long2", "split", "split2"];
  hairs.forEach((str) => {
    this.load.image(str, PUBLIC_URL + "/hair/" + str + ".svg");
    this.load.image("back_" + str, PUBLIC_URL + "/hair/back_" + str + ".svg");
  });

  this.load.image("head", PUBLIC_URL + "/head.svg");
  this.load.image("back_head", PUBLIC_URL + "/back_head.svg");

  classes.forEach((class_) => {
    this.load.image(`trunk_${class_}`, `${PUBLIC_URL}/trunk_${class_}.svg`);
    this.load.image(
      `trunk_back_${class_}`,
      `${PUBLIC_URL}/trunk_back_${class_}.svg`
    );
  });

  const ui = [
    "arrow_right",
    "panel",
    "announcement_bg",
    "button_move",
    "button_attack",
    "close_btn",
  ];
  ui.forEach((id: string) => {
    this.load.image(id, `${PUBLIC_URL}/ui/${id}.svg`);
  });

  const mapElems = ["ally_emblem", "enemy_emblem"];
  mapElems.forEach((id: string) => {
    this.load.image(id, `${PUBLIC_URL}/map/${id}.svg`);
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
    this.load.image(id, `${PUBLIC_URL}/${id}.svg`);
  });

  const props = [
    "props/grass",
    "props/bush",
    "props/far_tree_1",
    "props/branch",
  ];
  props.forEach((id: string) => {
    this.load.image(id, `${PUBLIC_URL}/${id}.svg`);
  });

  const tiles = [
    "tiles/grass",
    "tiles/woods",
    "tiles/mountain",
    "tiles/castle",
    "tiles/water",
    "tiles/beach-r",
    "tiles/beach-l",
    "tiles/beach-t",
    "tiles/beach-b",
    "tiles/beach-tr",
    "tiles/beach-tl",
    "tiles/beach-br",
    "tiles/beach-bl",

    "tiles/beach-b-and-r",
    "tiles/beach-t-and-r",
    "tiles/beach-b-and-l",
    "tiles/beach-t-and-l",
  ];
  tiles.forEach((id: string) => {
    this.load.image(id, `${PUBLIC_URL}/${id}.svg`);
  });

  const structures = ["tiles/town"];
  structures.forEach((id: string) => {
    this.load.image(id, `${PUBLIC_URL}/${id}.svg`);
  });

  // merano - Alois_Kirnig_-_Forst_Castle_on_the_Adige_near_Merano

  const castles = ["merano"];
  castles.forEach((id: string) => {
    this.load.image(id, `${PUBLIC_URL}/art/castles/${id}.jpg`);
  });

  const mp3s = [
    "title",
    "combat1",
    "map1",
    "sword_hit",
    "arrow_critical",
    "fireball",
  ];
  mp3s.forEach((id: string) => {
    this.load.audio(id, `${PUBLIC_URL}/music/${id}.mp3`);
  });

  const oggs = ["click1"];
  oggs.forEach((id: string) => {
    this.load.audio(id, `${PUBLIC_URL}/music/${id}.ogg`);
  });

  this.load.image("map_select", `${PUBLIC_URL}/scenes/map_select.png`);

  this.load.html("nameform", "assets/chara-creation/input.html");
}
