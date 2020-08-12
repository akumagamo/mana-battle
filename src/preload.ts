const PUBLIC_URL = 'assets';

export function preload(this: {
  load: {
    image: (key: string, path: string) => void;
    audio: (key: string, path: string) => void;
  };
  preload: () => void;
  create: (this: {preload: () => void; create: () => void}) => void;
}) {
  const images = [
    'insignea',
    'tile',
    'hand',
    'foot',
    'head',
    'backgrounds/plain',
    'backgrounds/sunset',
    'backgrounds/squad_edit',
  ];

  images.forEach((str) =>
    this.load.image(str, PUBLIC_URL + '/' + str + '.svg'),
  );
  const hairs = ['dark1', 'long1', 'long2', 'split', 'split2'];
  hairs.forEach((str) => {
    this.load.image(str, PUBLIC_URL + '/hair/' + str + '.svg');
    this.load.image('back_' + str, PUBLIC_URL + '/hair/back_' + str + '.svg');
  });

  this.load.image('head', PUBLIC_URL + '/head.svg');
  this.load.image('back_head', PUBLIC_URL + '/back_head.svg');

  const classes = ['fighter', 'knight', 'wizard'];

  classes.forEach((class_) => {
    this.load.image(`trunk_${class_}`, `${PUBLIC_URL}/trunk_${class_}.svg`);
    this.load.image(
      `trunk_back_${class_}`,
      `${PUBLIC_URL}/trunk_back_${class_}.svg`,
    );
  });

  const ui = ['arrow_right', 'panel'];
  ui.forEach((id: string) => {
    this.load.image(id, `${PUBLIC_URL}/ui/${id}.svg`);
  });

  const items = [
    'amulet',
    'iron_armor',
    'iron_shield',
    'iron_sword',
    'steel_armor',
    'steel_shield',
    'steel_sword',
    'baldar_armor',
    'baldar_shield',
    'baldar_sword',
    'oaken_staff',
  ];
  items.forEach((id: string) => {
    this.load.image(id, `${PUBLIC_URL}/items/${id}.png`);
  });

  const equips = [
    'equips/iron_sword',
    'equips/steel_sword',
    'equips/baldar_sword',
    'equips/oaken_staff',
  ];
  equips.forEach((id: string) => {
    this.load.image(id, `${PUBLIC_URL}/${id}.svg`);
  });

  const props = [
    'props/grass',
    'props/bush',
    'props/far_tree_1',
    'props/branch',
  ];
  props.forEach((id: string) => {
    this.load.image(id, `${PUBLIC_URL}/${id}.svg`);
  });

  const tiles = [
    'tiles/grass',
    'tiles/woods',
    'tiles/mountain',
    'tiles/castle',
    'tiles/water',
    'tiles/beach-r',
    'tiles/beach-l',
    'tiles/beach-t',
    'tiles/beach-b',
    'tiles/beach-tr',
    'tiles/beach-tl',
    'tiles/beach-br',
    'tiles/beach-bl',

    'tiles/beach-b-and-r',
    'tiles/beach-t-and-r',
    'tiles/beach-b-and-l',
    'tiles/beach-t-and-l',
  ];
  tiles.forEach((id: string) => {
    this.load.image(id, `${PUBLIC_URL}/${id}.svg`);
  });

  const structures = ['tiles/town'];
  structures.forEach((id: string) => {
    this.load.image(id, `${PUBLIC_URL}/${id}.png`);
  });

  // merano - Alois_Kirnig_-_Forst_Castle_on_the_Adige_near_Merano

  const castles = ['merano'];
  castles.forEach((id: string) => {
    this.load.image(id, `${PUBLIC_URL}/art/castles/${id}.jpg`);
  });

  const mp3s = ['title', 'combat1', 'map1', 'sword_hit'];
  mp3s.forEach((id: string) => {
    this.load.audio(id, `${PUBLIC_URL}/music/${id}.mp3`);
  });

  const oggs = ['click1'];
  oggs.forEach((id: string) => {
    this.load.audio(id, `${PUBLIC_URL}/music/${id}.ogg`);
  });
}
